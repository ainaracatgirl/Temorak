# Temorak
Survival game where you play alone or with friends.

Play at https://jancraft.github.io/Temorak/client/

Public gameplay providers, known as Servers, serve a different experience, our official server (not running as of 02-07-2020) serves a full vanilla (non-modded) experience.

Please, when creating a server, read our EULA, you might do things you aren't allowed to do.

### Temorak for Server Owners
For you, we have a server software and will soon have a documented guide (when it's ready, we will post the link here)

You can add PHOSKEL scripts to change the game experience.

### Temorak for Developers
For you, this game is fully OpenSource, so that's good for you, the server & client are not documented. I'm working on documenting every single code block.

The PHOSKEL scripts sent from the server to the client can run JS, **if someone discovers a security breach, post it on GitHub Issues**.

### Temorak Security
Ok, I am currently trying to change the WebSockets to SecureWebSockets, it's not actually easy.

The scripts that run in the client can run JS, I don't know if there's a security problem in that, considering that the password is always sent before the script, and the script will only run when there's a connection open. **If someone discovers a security breach, post it on GitHub Issues**.

Servers hash the password, and if they don't, they have the big problem, I don't have any control in that. If you think your password is not secure, contact the server owner and not me. **DO NOT USE THE SAME PASSWORD IN THE TEMORAK SERVERS AND OTHER SOCIAL MEDIA, IT MIGHT BE COMPROMISED**.