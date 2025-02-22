FROM mcr.microsoft.com/playwright:v1.50.1-noble
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate

WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .

# NOTE: prisma is already in package.json, biome is not installed
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install playwright@1.50.1

RUN echo DATABASE_URL='file:./dev.db' > .env
COPY prisma/schema.prisma prisma/schema.prisma

RUN pnpm exec prisma db push

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
