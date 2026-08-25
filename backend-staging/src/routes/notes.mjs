export function notesRoute(app) {
  return async function notes(request) {
    const path = new URL(request.url).pathname;
    return app.handle(new Request(new URL(path, request.url), request));
  };
}
