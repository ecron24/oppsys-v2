import { LinkButton } from "@/components/link-button";
import { routes } from "@/routes";
import { H1, P } from "@oppsys/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <P className="text-base font-semibold text-primary">404</P>
        <H1 className="mt-4">Page not found</H1>
        <P className="mt-6 text-lg font-medium text-pretty sm:text-xl/8">
          Sorry, we couldn't find the page you'rre looking for.
        </P>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <LinkButton to={routes.index()} variant={"default"}>
            Go back home
          </LinkButton>
          <LinkButton to="#" variant={"outline"}>
            Contact support <span aria-hidden="true">&rarr;</span>
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
