import "reflect-metadata";
import { join } from "node:path";
import { json, urlencoded } from "express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, bodyParser: false });
  // Default Express JSON limit (100kb) is far too small for marker uploads, which send a
  // base64-encoded photo/logo as a JSON field (see MarkersController / CreateMarkerDto).
  app.use(json({ limit: "15mb" }));
  app.use(urlencoded({ extended: true, limit: "15mb" }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Serves compiled marker images (originals + 8th Wall tracking derivatives) — see
  // MarkerCompileService, which writes here and returns URLs pointing back at this route.
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  // Render (and most PaaS hosts) assign a dynamic port via PORT and expect the
  // service to bind to it; API_PORT stays as the local-dev override.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PIKE API listening on :${port}`);
}

bootstrap();
