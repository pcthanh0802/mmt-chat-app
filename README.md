# mmt-chat-app

## Introduction

This is the chat application implemented for assignment 1 of Computer Networks (CO3093) course. Our group consists of the following members:

1. Phạm Hữu Đức (2052452)
2. Nguyễn Viết Hòa (2052486)
3. Phạm Châu Thanh (2052254)

## Installation guide

Since we did not deploy our work on any remote host server, please follow these steps to run this application locally on your computer:

1. Download Node.js and Visual Studio Code. After having installed VSC, turn on VSC and install extension **Live Server** to host the front-end later.
2. Download Wampserver64 from https://www.wampserver.com/en/download-wampserver-64bits/ to host the database. After installing it, turn it on and go to your browser, type "http://localhost". Wampserver dashboard will appear. Click on **phpMyAdmin 5.1.1** at the bottom of the screen to go to database dashboard.
3. Create a new database and name it **mmt-chat-app-db**, then click "Import" and select the **db.sql** file to create tables.
4. Download our source code or clone the Github repo to your computer
5. Go to _server_ folder, open terminal at this directory and type `npm i` to install necessary node_modules packages
6. Continue at _server_ folder, create **.env** file (the file's name is ".env"), open it and add the following into the file:

   ```
   DB="mysql://root:@localhost:3306/mmt-chat-app-db"

   ACCESS_TOKEN_SECRET="ba4a6ffca95e563c5e12554b49459c10f150b93b966492f7730d359253fe4c43c1bb02f162bbaacaf1a1c38406192c6a2b030a8352ccf12c219a4b6a3a022b21"
   REFRESH_TOKEN_SECRET="f65abaa12eccdd2d2736016efcb6383bfa62756edc426c4c6422e4b964df2ded1c068824d64ec0b32953c3ea47425d60c635cb4020a2ee72319dd757ffbf38ee"

   PORT=3528
   ```

7. Continue on the terminal of _server_ folder, type `npm run devStart` to start the server
8. Go to _client_ folder, open another terminal at this directory and type `code .`. Visual Studio Code will be opened with the folder displayed on the navigation bar on the left hand side of the screen.
9. (optional) If you want to test the application on 2 different computers **(but still connected to the same network)**, open **auth.js** in _shared_ folder and **main.js** in _auth_ folder, change `localhost` to **false** and change `ip` to your IPv4 address (to get your IPv4, open terminal and type `ipconfig`).
10. - From the navigation bar of VSC, open **index.html** (the outermost html file) and click **Go Live** at the bottom of the screen to turn on the front-end (VSC must not be closed after this step). The browser screen will show up with the log in page. You can directly log into the system with account **texting** and password **password123**, or you can create a new one by going to the register page.
    - On another machine, to access into the page, replace the localhost part of the url with its IPv4 address. (Ex: IPv4 address of hosting machine is `192.168.1.20`: http://localhost:5500/auth -> http://192.168.1.20:5500/auth)
11. To end front-end hosting, go back to VSC and click `Port: <port>` at the right corner of the bottom of the screen. To end back-end hosting, go back to the terminal of the back-end and click `Ctrl + C`.
