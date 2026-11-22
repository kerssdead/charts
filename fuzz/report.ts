import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { FuzzIssue, isFailure, isNoiseMessage } from './failures'

type FuzzRecord = {
    iter: number
    caseSeed: number
    fatal: string | null
    issues: FuzzIssue[]
    console: string[]
    steps: string[]
    dt: number
    g: unknown
    g2: unknown
}

type Bug = {
    signature: string
    title: string
    message: string
    browsers: Set<string>
    count: number
    sample: FuzzRecord
}

const ROOT = process.argv[2] || path.join(__dirname, 'results')
const STRICT = !!process.env.STRICT
const DRY_RUN = !!process.env.DRY_RUN
const LABEL = 'fuzzer'
const MAX_SETTINGS_LENGTH = 20000

const firstLine = (text: string) => text.split('\n')[0].trim()

const normalize = (text: string) => {
    return firstLine(text)
        .replace(/file:\/\/\S+/g, '<file>')
        .replace(/\d+(\.\d+)?/g, 'N')
        .slice(0, 200)
}

const getFailures = (record: FuzzRecord) => {
    const failures: FuzzIssue[] = []

    if (record.fatal)
        failures.push({ kind: 'fatal', msg: record.fatal })

    record.issues
        .filter(issue => isFailure(issue, STRICT))
        .forEach(issue => failures.push(issue))

    record.console
        .filter(message => !isNoiseMessage(message))
        .forEach(message => failures.push({ kind: 'console', msg: message }))

    if (record.dt > 20000)
        failures.push({ kind: 'slow', msg: 'Iteration took more than 20s' })

    return failures
}

const readRecords = (file: string) => {
    return fs.readFileSync(file, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line) as FuzzRecord)
}

const collectBugs = () => {
    const bugs = new Map<string, Bug>()

    if (!fs.existsSync(ROOT))
        return bugs

    for (const dir of fs.readdirSync(ROOT)) {
        const file = path.join(ROOT, dir, 'results.jsonl')

        if (!fs.existsSync(file))
            continue

        const browser = dir.replace(/^fuzz-results-/, '')

        for (const record of readRecords(file))
            for (const failure of getFailures(record)) {
                const kind = failure.kind === 'console' ? '' : failure.kind
                const text = normalize(failure.msg)
                const signature = createHash('sha1')
                    .update(kind + '|' + text)
                    .digest('hex')
                    .slice(0, 12)
                const bug = bugs.get(signature)

                if (bug) {
                    bug.browsers.add(browser)
                    bug.count++

                    continue
                }

                bugs.set(signature, {
                    signature,
                    title: `Fuzzer: ${ (kind ? kind + ': ' : '') + text }`.slice(0, 120),
                    message: failure.msg,
                    browsers: new Set([browser]),
                    count: 1,
                    sample: record
                })
            }
    }

    return bugs
}

const gh = (args: string[]) => {
    return execFileSync('gh', args, { encoding: 'utf8' })
}

const getKnownSignatures = () => {
    const issues = JSON.parse(gh([
        'issue', 'list',
        '--label', LABEL,
        '--state', 'all',
        '--limit', '1000',
        '--json', 'body'
    ])) as { body: string }[]

    return new Set(issues.flatMap(issue => [...issue.body.matchAll(/fuzz-signature: (\w+)/g)].map(match => match[1])))
}

const buildBody = (bug: Bug) => {
    const { sample } = bug
    const settings = JSON.stringify({ g: sample.g, g2: sample.g2 }, null, 2)
    const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
        ? `${ process.env.GITHUB_SERVER_URL }/${ process.env.GITHUB_REPOSITORY }/actions/runs/${ process.env.GITHUB_RUN_ID }`
        : ''

    return [
        '<!-- fuzz-signature: ' + bug.signature + ' -->',
        '',
        'Found by the fuzzer.',
        '',
        `- Browsers: ${ [...bug.browsers].join(', ') }`,
        `- Occurrences in run: ${ bug.count }`,
        `- Case seed: \`${ sample.caseSeed }\` (iteration ${ sample.iter })`,
        `- Steps: ${ sample.steps.join(', ') || 'none' }`,
        runUrl ? `- Run: ${ runUrl }` : '',
        '',
        '```',
        bug.message.slice(0, 3000),
        '```',
        '',
        '<details><summary>Settings</summary>',
        '',
        '```json',
        settings.length > MAX_SETTINGS_LENGTH ? settings.slice(0, MAX_SETTINGS_LENGTH) + '\n... truncated' : settings,
        '```',
        '',
        '</details>'
    ].join('\n')
}

const createIssue = (bug: Bug) => {
    const file = path.join(os.tmpdir(), `fuzz-issue-${ bug.signature }.md`)

    fs.writeFileSync(file, buildBody(bug))

    const created = JSON.parse(gh([
        'api', 'repos/{owner}/{repo}/issues',
        '-f', `title=${ bug.title }`,
        '-F', `body=@${ file }`,
        '-f', 'type=Bug',
        '-f', `labels[]=${ LABEL }`
    ])) as { html_url: string }

    return created.html_url
}

const main = () => {
    const bugs = collectBugs()

    console.log(`${ bugs.size } distinct bugs`)

    if (!bugs.size)
        return

    if (!DRY_RUN)
        gh(['label', 'create', LABEL, '--force', '--description', 'Found by the fuzzer'])

    const known = DRY_RUN ? new Set<string>() : getKnownSignatures()

    for (const bug of bugs.values()) {
        if (known.has(bug.signature)) {
            console.log(`known ${ bug.signature }: ${ bug.title }`)

            continue
        }

        console.log(DRY_RUN ? `would create ${ bug.signature }: ${ bug.title }` : `created ${ createIssue(bug) }`)
    }
}

main()