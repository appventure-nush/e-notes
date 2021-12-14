- [Backend](#backend)
  * [API Reference](#api-reference)
    - [Basics](#basics)
    - [Error handling](#error-handling)
    + [Routes](#routes)
    + [Authentication](#authentication)
    + [Roles](#roles)
    + [Users](#users)
    + [Audits](#audits)
    + [Collections](#collections)

# Backend

Backend for enotes, written in node.js and running express.js

## API Reference

Max file uplaod is 64MiB, extra data will be chopped off

#### Basics

`GET /api` will respond with some basic data

```json
{
    "status": "success",
    "name": "enotes api",
    "author": "zhao yun",
    "server_time": "2021-11-17T11:15:10.651Z",
    "client_ip": "::1",
    "logged_in_as": User
}
```

`GET /api/csrf` will give you your csrf token

```json
{
    "token": "S52gvcmw-_k-nmQgkHfABHjwhYQAm_NZlPpg"
}
```

#### Error handling

If response has a `status` field and it does not equal `success` most likely an error occurred. In most cases
check `.reason`.

### Routes

`/api/auth`\
`/api/roles`\
`/api/users`\
`/api/audits`\
`/api/collections`

### Authentication

`GET /api/auth` Current user, including profile

`POST /api/auth` Authenticate your token and create a session with set-cookie

- `token` the jwt token

`POST /api/auth/profile` Edit your profile

- `nickname` Nickname
- `desc` Description

`POST /api/auth/pfp` Upload new profile picture

- `file` the file \
  **Note** use FormData for file upload

`GET /api/auth/logout` Revoke session token validity

### Roles

`GET /api/roles` Get all roles

`GET /api/roles/:rid` Get specified role

`GET /api/roles/:rid/users` Get all users with specified role

`POST /api/roles/:rid/users` Mass grant/revoke users with specified role

- `action: 'add'|'remove'` action to take
- `uids: string[]` uids if is to give to users specified
- `emails: string[]` emails if is to ...

```json
{
    "updated": 0,
    // number of users updated
    "users": [
        User...
    ]
}
```

`DELETE /api/roles/:rid` Delete said role

`POST /api/roles/:rid` Create new role

- `rid` Redundancy
- `name`
- `desc`
- `defaultPerm: boolean`
- `permissions: {[cid:string]: boolean}`

`POST /api/roles/:rid/admin` Edit said role

- `name`
- `desc`
- `defaultPerm: boolean`
- `permissions: {[cid:string]: boolean}`

### Users

`GET /api/users` return all users, cached for 1 minute

`GET /api/users/:uid` fetch said user including profile

`POST /api/users/:uid` edit said user

- `roles` role id array
- `permissions: {[cid:string]: boolean}` manual override
- `teacher` if is teacher
- `name` name
- `nick` nickname
- `admin` if is admin, will modify custom claims in firebase
- `access` binary encoded permission flags for overriding inherited permissions, uses OR operation

```json
{
    "status": "...",
    "user": User
}
```

### Audits

volatile api

### Collections

`GET /api/collections` return all collections visible to current user

`GET /api/collections/:cid` return specified collection

`GET /api/collections/:cid/notes` return nots in collection

`GET /api/collections/:cid/roles` return roles with access to collection

`POST /api/collections/:cid/reorder` reorder notes in collection

- `[note id]`: `note position`

```json
{
    "notes": [
        Note...
    ]
}
```

`POST /api/collections/:cid` modify specified collection

- `action: 'add'|'edit'` action to take
- `name`
- `desc`
- `open`

```json
{
    "status": "...",
    "collection": Collection
}
```

`POST /api/collections/:cid/access` modify users allowed to view collection

- `emails` users to give access to

```json
{
    "status": "...",
    "collection": Collection
}
```

`DELETE /api/collections/:cid/access` clear modified view access

```json
{
    "status": "...",
    "collection": Collection
}
```

`DELETE /api/collections/:cid` delete said collection

`GET /api/collections/:cid/img` get images in collection

```json
[
    {
        "url": "https://storage.googleapis.com/e-notes-nush.appspot.com/collections/CS2231_AY2022/images/fig1.1.png",
        "name": "fig1.1.png"
    },
    {
        "url": "https://storage.googleapis.com/e-notes-nush.appspot.com/collections/CS2231_AY2022/images/fig1.10.png",
        "name": "fig1.10.png"
    },
    {
        "url": "https://storage.googleapis.com/e-notes-nush.appspot.com/collections/CS2231_AY2022/images/fig1.11.png",
        "name": "fig1.11.png"
    }
]
```

`POST /api/collections/:cid/img` upload single image to collection

- `file` remember to specify file name, will respect file name

`DELETE /api/collections/:cid/img/:img` delete said image by file name