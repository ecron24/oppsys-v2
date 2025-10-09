# Frontend Architecture

Frontend architecture refers to the structural design and organization of the client-side components of a web application. It encompasses the technologies, frameworks, patterns, and best practices used to build and maintain the user interface (UI) and user experience (UX) of web applications.

> Frontend is located on the `apps/client` folder of the repository.
> It use `react` and `react-router` as framework.
> All path mentioned here are relative to `apps/client` folder.

## Architecture

I will show you directly the architecture of a frontend application by explaining the different layers and components involved:

- `src/app`: This folder contains routes application. Only pages routes are located here.
- `src/components`: This folder contains components that are used throughout the application. These components can be reused in different parts of the application.
- `src/lib`: This folder contains utility functions and libraries that are used throughout the application. These can include helper functions, constants, and other shared code.
- `src/store`: This folder contains state management logic for the application. It uses `Zustand` as state management library.
- `src/types`: This folder contains TypeScript type definitions for the application.

## Rules

### 1. Combine specific components of a module into a single folder

When creating components that are specific to a particular module or feature, it is recommended to group them into a dedicated folder within the `src/components` directory. For example, if you have a module (menu) called **Search**, you create a folder `src/components/search` and place all related components inside this folder, such as `SearchBar`, `SearchResults`, and `SearchFilters`.

### 2. Always use `@tanstack/react-form` for form management

For managing forms in the application, it is advisable to use the `@tanstack/react-form` library. This library provides a robust and flexible way to handle form state, validation, and submission.

### 3. Create a field component for @tanstack/react-form

All tanstack field are located in the `src/components/form` folder. Each field should be created as a separate component. For example, you can create components like `TextField`, `SelectField`, and `CheckboxField` to represent different types of form inputs. As possible, each field component should contain label, field and error message. You can take a look at the `src/components/form/input-field.tsx` file for an example.

### 4. Always use `useAppForm` for form creation

When creating forms, it is recommended to use the `useAppForm` hook at `src/components/form/form-setup.tsx`.

### 5. Use `zod` for schema validation

For validating form data, use the `zod` library.

### 6. Use `@tanstack/react-query` for data fetching and mutations, never use server components for that

For handling data fetching and mutations, it is recommended to use the `react-query` library. All page should be a client component.

> Use `@tanstack/react-form` for form handling.
> Use `@tanstack/react-query` for data fetching.

### 7. Try to reuse components as much as possible

To promote code reusability and maintainability, it is advisable to reuse existing components whenever possible. All components is inside the `src/components` folder.

### 8. Try to use application design system as much as possible

The application design system is located in the `/packages/ui/src/styles/globals.css` file.

### 9. Navigation

When go to another page, use `ROUTES` constants from `apps/api/src/routes.ts`.

## Shadcn UI in `/packages/ui`

- When you create Shadcn components, add it in `/packages/ui`
- Always use them as possible

## Some notes

- Application is based on Tailwind CSS and Shadcn UI.
- For icons, use `lucide-react`

## Technologies

- zod: ^4.1.11
- "hono": "^4.9.9"
- "react": "^19.1.1"
- "react-dom": "^19.1.1"
- "tailwindcss": "^4.1.13"
