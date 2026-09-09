import { test, expect } from '@playwright/test';



test('User should login successfully', async ({ page }) => {

await page.goto('https://dojo.upexgalaxy.com/login');


await page.getByRole('textbox' , {name:'Email'}).fill(process.env.EMAIL!);

await page.getByRole('textbox' , {name:'Password'}).fill(process.env.PASSWORD!);

await page.getByRole('button' , {name:'Sign In'}).click();



await expect(page.getByRole('heading' , {name:'My Tasks'})).toBeVisible();
console.log(await page.getByRole('heading', { name: 'My Tasks' }).count())
});