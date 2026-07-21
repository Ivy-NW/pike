import "reflect-metadata";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
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
