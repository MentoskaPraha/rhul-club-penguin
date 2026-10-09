# RHUL Club Penguin
Club Penguin, but with the Royal Holloway, University of London Campus instead. Why? Because we can.

Original idea by cattywat from the RHUL CompSoc Discord.

## To Do

- [X] Decide on a Tech Stack
- [X] Design an Architecture
- [ ] Build the damn thing

## Requirements

1. [ ] Users connect and join the game through the browser.
1. [ ] User authentication.
1. [ ] User data persists.
1. [ ] All users should be able to see the actions of other users.
1. [ ] Users can move around the map.
1. [ ] Users can go into different buildings and areas on the map
1. [ ] The map is the RHUL Egham campus
1. [ ] Users can own a room in any of the dorm buildings.
1. [ ] Users can customise their rooms.
1. [ ] Users have coins.
1. [ ] Users get coins through activities.
1. [ ] Activities are around campus in different buildings.
1. [ ] Users can chat by typing in a message box.
1. [ ] Messages are displayed to all users in the same area via a text box above the user who sent it.

## Basic Design

The front-end is a game made with Phaser, while the back-end uses Colyseus to keep clients in sync and handle everything else. All game logic occurs on the server with users making requests to do specific things and then the server updating things accordingly.

The whole thing should be deployable as 1 docker container, with an optional Postgres connection setup with a SQLite database fallback.
