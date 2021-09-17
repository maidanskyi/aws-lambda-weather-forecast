FROM node:14-slim as builder
WORKDIR /usr/app
COPY ["package*.json", "tsconfig.json", "./"]
COPY ./src ./src
RUN npm ci && npm run build

FROM public.ecr.aws/lambda/nodejs:14
ENV NODE_ENV production
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./

CMD ["lambda.handler"]
