import { test, expect } from '@playwright/test';

test('使用有效凭据登录', async ({ page }) => {
  await page.goto('http://localhost:5174/login');

  await page.getByRole('textbox', { name: '* 用户名' }).fill('admin');
  await page.getByRole('textbox', { name: '* 密码' }).fill('123456');
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page.getByText('登录成功')).toBeVisible();
});