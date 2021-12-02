# 3. Permissions

[[toc]]

### Permission System

Permission is encoded in a 3 bit number

| 100        | 010      | 001      |
| ---------- | -------- | -------- |
| **CREATE** | **EDIT** | **VIEW** |

<small>Note that **CREATE** is not relevant for collection specific permissions</small>

### Permission Computation

The permission number may not be the same depending on the collection, it follows a set of rules in order.

- Starts with user's permission override, defaults to 000
- If the user is the owner of the collection, grants all permissions `111`
- If the user is a **teacher**, grants **CREATE** `100`
- If a collection is specified and the user has a permission specified for that collection
  - Grant or remove **VIEW** if the permission is `boolean`
  - Override the permission with set permission if a number is given
    - This will overwrite even the **owner's** rights, so be aware
  - This can only contain **EDIT** and **VIEW**
- If the user is an admin, grants all permissions `111`

The final permission number would dictate if the user is able to edit the specified collection(deletion included), create new collections, or view collections

### Collection Visibility

Collection visibility depends on more than just the permission number

- If you are admin, instant yes
- If the collection has a list of users that are allowed to view the collection, and if the user is contained in the list, instant yes
- If any of the user's roles has a deny access, denies access immediately
- If any of the following are met
  - A role allows access to the collection
  - The collection is public
  - The user's permission number computed against the collection has **VIEW**

### TLDR

- Create a role to represent a group of students
- In the role, set a permission of viewing that specific collection to true
- Grant the role to that group of students
- Done
