---
title: Learning TypeScript
date: "2022-02-19"
updated: "2022-02-19"
tags: 
- kubernetes
---

Some of the notes are take from the book [Programming TypeScript]

<!--truncate-->

### The keying-in operator

```ts
type APIResponse = {
  user: {
    userId: string;
    friendList: {
      count: number;
      friends: {
        firstName: string;
        lastName: string;
      }[];
    };
  };
};

type FriendList = APIResponse['user']['friendList']
```

### The keyof operator

```ts
type ResponseKeys = keyof APIResponse // 'user'
type UserKeys = keyof APIResponse['user'] // 'userId' | 'friendList'
type FriendListKeys = keyof APIResponse['user']['friendList'] // 'count' | 'friends'
```

[Programming TypeScript]: https://www.amazon.com/Programming-TypeScript-Making-JavaScript-Applications/dp/1492037656


### Mapped Types

https://www.typescriptlang.org/docs/handbook/2/mapped-types.html


### Companion Object Pattern

> in the same scope, you can have the same name bound to both a type and a value.
> It lets you group type and value information that’s semantically part of a single name (like Currency) together. It also lets consum‐ ers import both at once:

```ts
import {Currency} from './Currency'
```
