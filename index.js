const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 3000;

// 从环境变量读取 Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('请设置环境变量 BOT_TOKEN');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// 处理 /start 命令，发送内联键盘
bot.start((ctx) => {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎮 进入游戏', web_app: { url: 'https://tanqingyubaobao-cyber.github.io/my-game-app/' } },
        { text: '💰 充值', web_app: { url: 'https://tanqingyubaobao-cyber.github.io/my-game-app/?page=recharge' } }
      ],
      [
        { text: '💸 提现', web_app: { url: 'https://tanqingyubaobao-cyber.github.io/my-game-app/?page=withdraw' } },
        { text: '👥 邀请好友', callback_data: 'invite' }
      ],
      [
        { text: '📞 官方客服', url: 'https://t.me/letianUSDT' },
        { text: '📱 下载 APP', url: 'https://98.3627293.xyz/' }
      ]
    ]
  };
  ctx.reply('欢迎使用天游国际！点击下方按钮快速操作：', {
    reply_markup: keyboard
  });
});

// 处理邀请好友的回调查询
bot.action('invite', async (ctx) => {
  const inviteLink = 'https://t.me/tianyouyuleBot?start=invite_xxx';
  await ctx.answerCbQuery(); // 关闭回调提示
  await ctx.reply(`邀请链接已复制到剪贴板：\n${inviteLink}`, {
    reply_markup: { inline_keyboard: [[{ text: '复制链接', callback_data: 'copy' }]] }
  });
});

// 处理复制链接按钮（可选，提供再次复制）
bot.action('copy', async (ctx) => {
  const inviteLink = 'https://t.me/tianyouyuleBot?start=invite_xxx';
  await ctx.answerCbQuery();
  await ctx.reply(`邀请链接：${inviteLink}`, {
    reply_markup: { inline_keyboard: [[{ text: '复制链接', callback_data: 'copy' }]] }
  });
});

// 设置 Webhook
app.use(express.json());
app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body, res);
});
app.get('/', (req, res) => res.send('Bot is running'));

// 启动服务器，并设置 Webhook
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);

  // 获取 Render 提供的公网 URL
  let externalUrl = process.env.RENDER_EXTERNAL_URL;
  if (!externalUrl && process.env.RENDER_EXTERNAL_HOSTNAME) {
    externalUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
  }
  if (!externalUrl) {
    console.error('无法获取 Render 公网 URL，Webhook 设置失败。请确保在 Render 环境中运行。');
    return;
  }

  const webhookUrl = `${externalUrl}/webhook/${BOT_TOKEN}`;
  console.log(`尝试设置 Webhook 为: ${webhookUrl}`);

  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook 设置成功');
  } catch (err) {
    console.error('设置 Webhook 失败:', err);
    // 不退出进程，让服务器继续运行
  }
});