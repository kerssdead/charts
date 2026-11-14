import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import Clip from '@e2e/utils/Clip'

test(
    'Chart height should be resized',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()
        await Settings.height(50)

        await Utils.checkRender(
            '7eb449d1',
            new Clip(299, 270, 330, 180)
        )
    }
)