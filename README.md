# Judy

A small custom Discord bot with a highly generic code-base made with [Discord.js](https://discord.js.org/#/)
which supports slash-commands, cron-jobs and much more.

<img src="https://sm.ign.com/ign_br/screenshot/default/cyberpunk-2077-judy-alvarez_ene6.jpg" width="100%">

### Features

- **Autoloader** : auto-loads and updates events, slash-commands and cron-jobs
- **Logs** : logs deleted/edited messages, user joining/quitting the server
- **Temporary vocal channels** : Join a vocal channel to spawn your own vocal channel and gives you
inherited category permissions + edit permissions.
- **Birthdays** : Add your members birthdays and be notified in a desired channel
- [Fork and add your own in `./events`, `./commands` and `./scheduled`]

### Deployment 
__Docker__: 

`docker pull ghcr.io/alexpresso/judy-discord-bot:latest` (other images are available [here](https://github.com/AlexPresso/judy-discord-bot/pkgs/container/judy-discord-bot))

__Kubernetes__: 
- `helm repo add alexpresso helm.alexpresso.me`
- `helm install judy alexpresso/judy` (see available values [here](https://github.com/AlexPresso/helm.alexpresso.me/blob/main/charts/judy-discord-bot/values.yaml))