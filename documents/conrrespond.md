# Conrrenspond

## server to client

### abort

- null
- a request waiting the player abort the game

### action-pos

- null
- a request waiting the player choose a pos

### room-info

- RoomInfo | null
- player's room information

### game-info

- GobangGameInfo
- gobang game information

### rest-time

- number
- the action rest time

### action-finished

- null
- a accept response to last action

### time-out

- null
- a timeout response to last action

### game-end

- GameResultInfo
- gameresult information

### room-list

- RoomInfo[]
- All room information

### response-start-game

- ResponseInfo
- response to 'start-game' event

### response-create-room

- ResponseInfo
- response to 'create-room' event

### response-join-room

- ResponseInfo
- response to 'join-room' event

## client to server

### login

- { name: string, socketId: string }
- a simple login

### get-game-info

- null
- try to get 'game-info' event

### exit-room

- null
- exit present room

### change-ok

- boolean
- change the ok state in room

### get-room-list

- null
- try to get 'room-list' event

### join-room

- string
- join a room

### quick-game

- number
- quick start a game with ai. number is your turn

### resolve-abort

- null
- a resolve to 'abort' event

### resolve-action-pos

- [number, number]
- a resolve to 'action-pos' event

### create-room

- string
- create a room and join it

### kick-player

- index: number
- kick a player in your room(or kick yourself)

### change-charater-type

- index: number
- change the charater type in your room

### start-game

- null
- start game with your room

### get-room-info

- null
- try to get 'room-info' event
