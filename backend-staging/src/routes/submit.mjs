export function submitRoute(app) {
  return async function submit(request) {
    return app.handle(new Request(new URL("/submit", request.url), request));
  };
}
