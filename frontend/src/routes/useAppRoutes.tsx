import { Outlet, useRoutes } from "react-router-dom";
import { Home } from "./home";
import { NotFound } from "./notFound";
import { AttributeDetail, Attributes } from "./attributes";

export const useAppRoutes = () =>
  useRoutes([
    {
      children: [
        {
          children: [
            {
              element: <AttributeDetail/>,
              path: ':id',
            },
            {
              element: <Attributes/>,
              path: '',
            }
          ],
          element: <Outlet/>,
          path: 'attributes'
        },
        {
          element: <Home/>,
          path: ''
        }
      ],
      element: <Outlet />,
      path: "/",
    },
    {
      element: <NotFound />,
      path: "*",
    },
  ]);
