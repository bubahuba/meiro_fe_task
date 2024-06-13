import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Helmet } from "react-helmet";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  DataGrid,
  GridColDef,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";

import {
  Attribute,
  AttributesQueryParams,
  Label,
  LabelsQueryParams,
  SortBy,
  SortDir,
  useAttributeDeleteApi,
  useAttributesApi,
  useLabelsApi,
} from "../../api";
import {
  DeleteAttributeDialogOptions,
  DeleteAttributeDialog,
} from "../../components";

export const Attributes = () => {
  const gridApiRef = useGridApiRef();
  const location = useLocation();
  const scrollMonitor = useRef<() => void>();

  const [attributesQueryParams, setAttributesQueryParams] =
    useState<AttributesQueryParams>(
      location.state?.attributesQueryParams || {
        limit: 10,
        offset: 0,
        searchText: "",
        sortBy: "name",
        sortDir: "asc",
      }
    );

  const [labelsQueryParams, setLabelsQueryParams] = useState<LabelsQueryParams>(
    location.state?.labelParams || {
      limit: 10,
      offset: 0,
    }
  );

  const [searchText, setSearchText] = useState<string>(
    location.state?.attributesQueryParams
      ? location.state.attributesQueryParams.searchText
      : ""
  );

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [snackBarOpen, setSnackBarOpen] = useState<string | undefined>(
    undefined
  );

  const [gridSortModel, setGridSortModel] = useState<GridSortModel>(
    location.state?.attributesQueryParams
      ? [
          {
            field: location.state.attributesQueryParams.sortBy,
            sort: location.state.attributesQueryParams.sortDir,
          },
        ]
      : [
          {
            field: "name",
            sort: "asc",
          },
        ]
  );

  const [loadedLabels, setLoadedLabels] = useState<Label[]>([]);
  const debouncedSearchText = useDebounce(searchText, 500);

  const attributesApi = useAttributesApi(attributesQueryParams);
  const labelsApi = useLabelsApi(labelsQueryParams);
  const attributeDeleteApi = useAttributeDeleteApi();

  const handleScroll = useCallback(() => {
    if (gridApiRef.current?.instanceId) {
      const currentRowCount = gridApiRef.current.getRowsCount();
      const scrollPosition = gridApiRef.current.getScrollPosition();
      const rowHeight = gridApiRef.current.getRootDimensions().rowHeight;
      const totalRowHeight = currentRowCount * rowHeight;
      const innerSize =
        gridApiRef.current.getRootDimensions().viewportInnerSize.height;

      if (
        scrollPosition.top + innerSize === totalRowHeight &&
        attributesApi.data?.pages
      ) {
        const loadMore =
          attributesApi.data.pages[attributesApi.data.pages.length - 1].meta
            .hasNextPage;
        if (loadMore)
          attributesApi.fetchNextPage().then((resp) => {
            if (resp.data) {
              const metaData = resp.data.pages[resp.data.pages.length - 1].meta;
              delete metaData.hasNextPage;
              setAttributesQueryParams(metaData);
              scrollMonitor.current && scrollMonitor.current();
            }
          });
      }
    }
  }, [attributesApi, gridApiRef]);

  const columns: GridColDef[] = [
    {
      field: "id",
      filterable: false,
      headerName: "ID",
      type: "number",
      sortable: false,
    },
    {
      field: "name",
      filterable: false,
      flex: 1,
      headerName: "Name",
      minWidth: 250,
      renderCell: (params) => (
        <Link
          to={"/attributes/" + params.row.id}
          state={{ attributesQueryParams: attributesQueryParams }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "labelIds",
      filterable: false,
      flex: 1,
      headerName: "Labels",
      minWidth: 300,
      renderCell: (params) => {
        if (!loadedLabels.length) return <CircularProgress size="small" />;
        const rowLabels: (string | undefined)[] = [];

        params.value.forEach((labelId: string) => {
          rowLabels.push(
            loadedLabels.find((label) => Number(label.id) === Number(labelId))
              ?.name
          );
        });
        return rowLabels.map((el, i) => (
          <Chip key={i} variant="outlined" label={el} sx={{ marginRight: 1 }} />
        ));
      },
      sortable: false,
    },
    {
      field: "createdAt",
      filterable: false,
      flex: 1,
      minWidth: 250,
      headerName: "Created at",
      renderCell: (params) => new Date(params.value).toLocaleString("cs-CZ"),
    },
    {
      field: "action",
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => setItemToDelete(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const allLabels = useMemo(() => {
    if (!labelsApi.data) return;
    setLoadedLabels(labelsApi.data.pages.flatMap((page) => page.data));
  }, [labelsApi.data]);

  const loadedRows = useMemo(() => {
    let updatedData: Attribute[] = [];

    attributesApi.data?.pages.forEach((page) => {
      updatedData = [...updatedData, ...page.data];
    });

    return updatedData;
  }, [attributesApi.data]);

  const onSortModelChange = (model: GridSortModel) => {
    setGridSortModel(model.length ? model : [{ field: "name", sort: "asc" }]);
    const modelData = model[0];
    if (modelData) {
      setAttributesQueryParams({
        ...attributesQueryParams,
        sortBy: modelData.field as SortBy,
        sortDir: modelData.sort as SortDir,
      });
    } else {
      setAttributesQueryParams({
        ...attributesQueryParams,
        sortBy: "name",
        sortDir: "asc",
      });
    }
    scrollMonitor.current && scrollMonitor.current();
  };

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const deleteAttribute = (id: string) => {
    if (!id) {
      return;
    }
    attributeDeleteApi.mutate({ id, params: attributesQueryParams });
    setTimeout(() => attributesApi.refetch(), 200);
  };

  const proceedDialogActions = (option: DeleteAttributeDialogOptions) => {
    switch (option.id) {
      case 1: {
        if (!itemToDelete) {
          return;
        }
        deleteAttribute(itemToDelete);
        setItemToDelete(null);
        setSnackBarOpen(
          loadedRows.find((row) => row.id === itemToDelete)?.name
        );

        break;
      }
      default: {
        setItemToDelete(null);
      }
    }
  };

  useEffect(() => {
    if (gridApiRef.current?.instanceId) {
      scrollMonitor.current && scrollMonitor.current();

      scrollMonitor.current = gridApiRef.current?.subscribeEvent(
        "scrollPositionChange",
        () => {
          handleScroll();
        }
      );
    }
  }, [gridApiRef, handleScroll]);

  useEffect(() => {
    if (!labelsApi.data) return;

    if (
      labelsApi.data.pages[labelsApi.data.pages.length - 1].meta.hasNextPage
    ) {
      labelsApi.fetchNextPage().then((resp) => {
        if (resp.data) {
          const metaData = resp.data.pages[resp.data.pages.length - 1].meta;
          delete metaData.hasNextPage;
          setLabelsQueryParams(metaData);
        }
      });
    }
  }, [labelsApi]);

  useEffect(() => {
    if (!labelsApi.data) return;
    allLabels;
  }, [allLabels, labelsApi.data]);

  useEffect(() => {
    setAttributesQueryParams({
      ...attributesQueryParams,
      searchText: debouncedSearchText,
    });
  }, [attributesQueryParams, debouncedSearchText]);

  useEffect(() => {
    if (location.state) {
      setSearchText(location.state.attributesQueryParams.searchText);
      setAttributesQueryParams(location.state.attributesQueryParams);
      setGridSortModel([
        {
          field: location.state.attributesQueryParams.sortBy,
          sort: location.state.attributesQueryParams.sortDir,
        },
      ]);
    }
  }, [location.state]);

  return (
    <>
      <Helmet>
        <title>Attributes | Meiro Frontend task</title>
      </Helmet>
      <Link to="/">
        <Typography variant="h2">Home</Typography>
      </Link>
      <Typography variant="h1">Attributes</Typography>
      <TextField
        value={searchText}
        onChange={onSearchTextChange}
        placeholder="Search attributes"
        variant="standard"
      />
      <Box sx={{ height: 400, marginTop: 2, maxWidth: 1200, width: "100%" }}>
        <DataGrid
          hideFooter
          columns={columns}
          disableColumnMenu
          rows={loadedRows}
          apiRef={gridApiRef}
          sortingMode="server"
          autosizeOptions={{
            columns: ["name", "createdAt"],
            includeOutliers: true,
            includeHeaders: true,
          }}
          sortModel={gridSortModel}
          onSortModelChange={onSortModelChange}
        />
      </Box>
      <DeleteAttributeDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        options={[
          {
            id: 0,
            buttonText: "No",
          },
          {
            id: 1,
            buttonText: "Yes",
            color: "error",
          },
        ]}
        onConfirm={proceedDialogActions}
        title={"Warning"}
        text={"Do you really want to delete this attribute?"}
      />

      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={Boolean(snackBarOpen)}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(undefined)}
      >
        <Alert
          onClose={() => setSnackBarOpen(undefined)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Attribute <b>{snackBarOpen}</b> was deleted
        </Alert>
      </Snackbar>
    </>
  );
};
