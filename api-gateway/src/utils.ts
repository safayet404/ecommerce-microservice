import axios from "axios";
import { Express } from "express";
import config from "./config.json";
import { Request, Response, NextFunction } from "express";

export const createHandler = (
  hostname: string,
  path: string,
  method: string
) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostname}${path}`;
      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });
      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers: {
          origin: "http://localhost:8081",
        },
      });

      res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        return res
          .status(error.response?.status || 500)
          .json(error.response?.data);
      } else {
        return res.status(500).json({ message: "internal server error" });
      }
    }
  };
};

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([_name, service]) => {
    const hostname = service.url;

    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostname, route.path, method);
        app[method](`/api${route.path}`, handler);
      });
    });
  });
};
