# Toripoliisi

Toripoliisi is a Telegram bot made for checking new items from Tori.fi searches periodically (once per minute). Users can ask Toripoliisi to keep checking specific URL:s for new items, and when new items arrive, the bot will send Telegram message with preview image to the user. This bot was developed because Tori's own similar feature called Hakuvahti is crap: the email is sent only daily, and the mobile app is super annoying, sending fake notifications, and overall being buggy and unusable at times. In addition, even the push notifications seem to arrive later to some users, so using external service such as this Toripoliisi seems to give some advantage. The bot should be running in Telegram bebind a nickname called [@Toripoliisibot](https://t.me/toripoliisibot).

Originally this code was written with Deno, but then it got old and didn't launch anymore, due to some packages getting deprecated and whatnot. After I got pissed at Hakuvahti and Tori app again, I decided to revive this project and ran the whole codebase throuch ChatGPT, since I really didn't remember how this worked and I didn't want to use more time than what was necessary :-) ChatGPT did quite good job to be honest, even when changing to entirely different dependencies, so hooray AI!

## Starting the bot locally

This bot is written using Typescript. Run this command when developing:

`yarn run dev`

In order for Bot to start successfully, you need .env file with telegram bot `TOKEN`.

## Project future

I have no plans to extend the bot functionalities further. But pull requests are very welcome! You can also message me via Telegram [@Mighop](https://t.me/mighop).