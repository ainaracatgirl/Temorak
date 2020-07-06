**[Disconnect-Codes]**
 - [3000] Policy/protocol violation
 - [3001] Not authorized/auto reconnect
 - [3002] Kicked/banned
 - [3003] Server closed/restarting

[19-06-2020]
- Created barebones project
- Defined folder structure

[21-06-2020] *TDR-1 PTDR-1*
- Added GAMEPAD support
- Added icons for the active input devices
- Added a ResourceLoader script
- Created the TDR convention (Terminal Development Report) for version control. Started its usage at 'TDR-1'
- Created the PTDR convention (Protocol TDR) for protocol version control. Starting its usage at 'PTDR-1'
- Created server software
- Added "modals" for login & register

[22-06-2020] *TDR-1 PTDR-1*
- Added safe client list removal
- Found & solved the **null** username bug.
- Solved 2 players with same username online.
- Added production webpage in GitHub Pages.
- No development webpage will be created. Use the *PHP WebServer* instead.

[24-06-2020] *TDR-1 PTDR-2*
- Added client knowledge of the online users
    {username: String, x: Float, y: Float, dir: String} Edit: 03-07-2020
- *BUG-FIX* When a close event ocurrs, reconnect can fail.
- Added chat
- Added join & leave messages
- Switched the background color to 'skyblue'

[02-07-2020] *TDR-1 PTDR-3*
- Added chat menu, need to change the scrollbar (its ugly)
- Added multiple server commands (Stop, Set-Operator, Unset-Operator)
- Added player positions
- Added player rendering
- Added the state packet

[03-07-2020] *TDR-1 PTDR-3*
- Added the camera, follows player
- Extended the state packet, still compatible, sends direction
- Added direction lines for players
- Found disconnect modal bug (when no error message, last one was used), fixed
- Added kick command (Server: Kick -player- Client: /Kick -player-)
- Added "Uptime" command, showing the time the server has been up
- Added "?ignoreserverversion=1"

[05-07-2020] *TDR-1 PTDR-3*
- Updated all the server system, now using events