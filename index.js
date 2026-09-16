const http = require("http")
const fs = require("fs")
const path = require("path")
const qstring = require("querystring")
const port = 6551
const htmlfile = fs.readFileSync(path.join(__dirname, "index.html"))
const db = fs.readFileSync(path.join(__dirname, "db.json"))

function addProduct(req, res) {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        data = qstring.parse(data);
        let products = { products: [] };

        if (fs.existsSync(path.join(__dirname, "db.json"))) {
            products = JSON.parse(
                fs.readFileSync(path.join(__dirname, "db.json"), "utf8")
            );
        }

        products.products.push(data);

        fs.writeFileSync(
            path.join(__dirname, "db.json"),
            JSON.stringify(products)
        );

        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
    });
}

function getProducts(req, res) {
    let products = { products: [] };

    if (fs.existsSync(path.join(__dirname, "db.json"))) {
        const data = fs.readFileSync(path.join(__dirname, "db.json"));
        products = JSON.parse(data.toString());
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
}

function methodNotAllowed(res) {
    res.writeHead(405, { "Content-Type": "text/html" });
    res.end("405 Method Not Allowed");
}

http.createServer((req, res) => {
    switch (req.url) {
        case "/":
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(htmlfile);
            break;
        case "/add":
            if (req.method == "POST") {
                addProduct(req, res);
            } else {
                methodNotAllowed(res);
            }
            break;
        case "/products":
            if (req.method == "GET") {
                getProducts(req, res);
            } else {
                methodNotAllowed(res);
            }
            break;
        case "/api/v1/hellopostmanuser":
            if (req.method == "GET") {
                res.end("hello postman user!")
            } else {
                methodNotAllowed(res);
            }
            break;
        default:
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("404 Not Found");
            break;
    }
}).listen(port, console.log("http://localhost:" + port))
