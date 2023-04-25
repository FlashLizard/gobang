# Gobang

You can visit [Online Chess Game Platform](http://ocgp.flashlizard.tk/) to see the Final Result.

## Description

This is a web chess application with lobby feature. I have accomplished login and ai(use $\alpha - \beta$ Pruning Algorithm) features.

## How To Deploy Simply

1. install npm
2. git clone the repository
3. at the project root dictory, run:

    ```bash
    npm run deploy
    ```

4. run the client and the server by:

    ```bash
    npm run client
    ```

    and

    ```bash
    npm run server
    ```

    after both of them have being running, visit <http://localhost:3000> to see the result.

now you can try it!

## How To Deploy In a Server

If you want to deplay the web app in your server and make others can visit it, not just in your computer, you should see this chapter.

First you should have a global ip, otherwise others can't visit your ip. Or you can use some functions like using a frp app(a example <https://www.natfrp.com/>) or NAT traverse technique. And you better hava a domain name and host it to a domain name hosting service like cloudflare.

Second you should deploy a http server app like nginx. There is a introduction <https://www.yiibai.com/nginx>.

Please ensure you have finshed both steps above. Then you can run commands below in the project root directory:

```bash
cd client
npm run build
```

Then, you will see a build folder in client directory. It is the static web client file. You can move it to anywhere you want(or don't move), and remenber the path(I assume it as /home/project/web/gobang).

to be continued...
