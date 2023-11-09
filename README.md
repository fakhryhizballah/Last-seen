
# Last seen

Api Broker to record when a user is born using the rest api method and using the Redis database



## API Reference

#### Get all lastseen

```http
  GET /api/lastseen/${id_app}
```
#### Get Online User

```http
  GET /api/online/${id_app}
```


#### Post Seen

```http
  GET /api/seen/${id_app}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id User |
| `name`      | `string` | **Required**. User Name |

