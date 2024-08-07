import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import bodyParser from "body-parser";
import AuthRoutes from "./routes/AuthRoutes";
import BookRoutes from "./routes/BookRoutes";
import BookOrderedRoutes from "./routes/BookOrderedRoutes";
import setupSwagger from "./swagger";

createConnection().then(async connection => {
	const app = express();
	app.use(bodyParser.json());

	app.use("/auth", AuthRoutes);
	app.use("/book", BookRoutes);
	app.use("/book-ordered", BookOrderedRoutes);

	setupSwagger(app);

	app.listen(3000, () => {
		console.log("Server is running on port 3000");
	});
}).catch(error => console.log(error));
