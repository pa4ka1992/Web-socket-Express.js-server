# async-race-api
Api for Rolling Scopes School task "RS-clone BattleShip by Power Rangers".

## Setup and Running

- You can send requests to the address: `https://battle-ship.up.railway.app/api`.

## Usage

- **Endpoints**
    - [Log in](https://github.com/pa4ka1992/Battleship#log-in)
    - [Log out](https://github.com/pa4ka1992/Battleship#log-out)
    - [Refresh token](https://github.com/pa4ka1992/Battleship#refresh-token)
    - [Get users](https://github.com/pa4ka1992/Battleship#get-users)
    - [Start game](https://github.com/pa4ka1992/Battleship#start-game)

**Log in**
----
Log in user to the game.

<details>

* **URL**

    /login

* **Method:**

    `POST`

* **Headers:**

    None

*  **URL Params**

    None

* **Query Params**

    None

* **Data Params**

    ```json
        {
          "name": "user name",
        }
    ```

* **Success Response:**

  * **Code:** 200 OK <br />
    **Content:** 
    ```json
      {
        "accessToken": "token",
        "refreshToken": "token",
        "name": "user name",
        "id": "id number"
      }
    ```
    **Headers:**
    ```
      "set-cookie": "refreshToken=token text"
    ```

    **Cookies:**
    ```
      "Cookie value"
    ```
 
* **Errors Response:**

  * **Code:** 403 Forbidden <br />
    **Content:** 

    ```json
    {
      "message": "Имя слишком короткое"
    }
    ```

  * **Code:** 401 Unauthorized <br />
  **Content:** 

    ```json
    {
    "message": "Пользователь с таким именем уже существует"
    }
    ```

</details>

**Log out**
----
Log out user from the game.

<details>

* **URL**

    /logout

* **Method:**

    `DELETE`

* **Headers requaired!:**

    `'Cookie': 'refreshToken=<token value received after login>'`

*  **URL Params**

    None

* **Query Params**

    None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 OK <br />
    **Content:** 
    ```json
    {
      "message": "Пользователь удален"
    }
    ```
    **Headers:**
    ```
      "set-cookie": "refreshToken="
    ```
 
* **Error Response:**

  * **Code:** 403 Forbidden <br />
    **Content:** 
    ```json
    {
      "message": "Ошибка выхода"
    }

    "or"

    {
      "message": "Ошибка обновления токена"
    }
    ```

* **Notes:**

    `Response success only with request header!`

</details>

**Refresh token**
----
Refresh user's tokens

<details>

* **URL**

    /refresh

* **Method:**

    `GET`

* **Headers requaired!:**

    `'Cookie': 'refreshToken=<token value received after login>'`

*  **URL Params**

    None

* **Query Params**

    None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 OK <br />
    **Content:** 
    ```json
      {
        "accessToken": "token",
        "refreshToken": "token",
        "name": "user name",
        "id": "id number"
      }
    ```
    **Headers:**
    ```
      "set-cookie": "refreshToken=token text"
    ```

    **Cookies:**
    ```
      "Cookie value"
    ```
 
* **Error Response:**

  * **Code:** 403 Forbidden <br />
    **Content:** 
    ```json
    {
      "message": "Ошибка обновления токена"
    }
    ```

* **Notes:**

    `Response success only with request header!`

</details>


**Get users**
----
get all users

<details>

* **URL**

    /getusers

* **Method:**

    `GET`

* **Headers requaired!:**

    `'Cookie': 'refreshToken=<token value received after login>'`

    `'Authorization': 'Bearer <access token received after login>'`

*  **URL Params**

    None

* **Query Params**

    None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 OK <br />
    **Content:** 
      ```json
      [
        {
            "_id": "63fd22708f63d0e412e07fcc",
            "name": "хук",
            "isWaitingGame": false,
            "gameId": "",
            "__v": 0
        },
        {
            "_id": "63fd24828f63d0e412e07fe8",
            "name": "пук",
            "isWaitingGame": false,
            "gameId": "",
            "__v": 0
        },
      ]
      ```
 
* **Error Response:**

  * **Code:** 401 Unauthorized <br />
    **Content:** 
    ```json
    {
      "message": "Пользователь не авторизован"
    }

* **Notes:**

    `Response success only with request headers!`

</details>

**Start game**
----
Start online game

<details>

* **URL**

    /startgame

* **Method:**

    `PATCH`

* **Headers requaired!:**

    `'Cookie': 'refreshToken=<token value received after login>'`

    `'Authorization': 'Bearer <access token received after login>'`

*  **URL Params**

    None

* **Query Params**

    None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 OK <br />
    **Content:** 
    ```json
      {
        "gameId": "63fef7482106044bacdfc6b5",
        "user": {
          "id": "63fef7482106044bacdfc6b5",
          "name": "user name"
        }
      }
    ```
 
* **Error Response:**

  * **Code:** 401 Unauthorized <br />
    **Content:** 
    ```json
    {
      "message": "Пользователь не авторизован"
    }

* **Notes:**

    `Response success only with request headers!`

</details>