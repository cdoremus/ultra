import { assertEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { renderToStream } from "../../lib/render.ts";
import useAsync from "../../hooks/use-async.js";

Deno.test("useAsync hook", async () => {
  // deno-lint-ignore no-explicit-any
  let callback: () => Promise<any>;

  const App = () => {
    callback = useAsync(() =>
      fetch(
        "https://jsonplaceholder.typicode.com/todos/1",
      ).then((response) => response.json())
    );
    return (
      <html>
        <head>
          <title>Testing</title>
        </head>
        <body>
          <div>Hello World</div>
        </body>
      </html>
    );
  };

  const stream = await renderToStream(
    <App />,
    undefined,
    {
      baseUrl: "/",
      importMap: { imports: {} },
      assetManifest: undefined,
    },
  );

  const response = new Response(stream);
  const text = await response.text();
  const data = await callback!();

  assertEquals(data, {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  });

  assertEquals(
    text.includes(
      '<script id="ultra-async-data-stream-:R0:" type="application/json">{"userId":1,"id":1,"title":"delectus aut autem","completed":false}</script>',
    ),
    true,
  );
});
