# Note pad api

Used in conjunction with the Notely app, this API provides the functionality for creating todos and notes, adding todos and note, deleting and updating todos and notes.

You can also view the [live site](https://note-pad-app-mayenthedeveloper.vercel.app) or visit the [frontend repo.](https://github.com/Mayenthedeveloper/note-app-app)

This API is not open for public use at this time. 

# Endpoints


##  /notes
| Route                     | Request        |Body             |Result                      |
|   ----------              |  ----------    |--------------   | --------                   |
| /products                 | GET            |                 |return all product          |
| /products/:product_id     | GET            |                 |return product with that ID |


##  /todos
| Route                     | Request        |Body             |Result                      |
|   ----------              |  ----------    |--------------   | --------                   |
| /products                 | GET            |                 |return all product          |
| /products/:product_id     | GET            |                 |return product with that ID |


## Status codes
| Code              | Endpoint                        |Request                    |Possible reason                                                  |
|   ----------      |  ----------                     |--------------             | --------                                                        |
| 500               | any                             |   any                     |Server error                                                     |
| 200               | any                             |   GET                     |Data was successfully returned.                                  |
| 201               | any                             |   POST                    |Your POST was successful.                                        |
| 204               | any with an id path param       |   PATCH                   |Your entry was successfully updated.                             |
| 204               | any with an id path param       |   DELETE                  |Your entry was successfully deleted.                             |
| 400               | any                             |   POST                    |A required query param in the body is missing.                   | 
| 404               | any with an id path param       |   GET, DELETE, or PATCH   |An entry with that ID doesn't exist.                             |
| 400               | any with an id path param       |   PATCH                   |You must include at least one of the query params in the body.   |



## Tech Stack

* Javascript
* React
* Node.js
* Postgres
* HTML
* CSS
