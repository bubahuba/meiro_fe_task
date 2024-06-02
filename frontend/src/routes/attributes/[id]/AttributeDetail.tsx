import { Alert, Button, Chip, Snackbar, Typography } from "@mui/material";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  Label,
  LabelsQueryParams,
  useAttributeDeleteApi,
  useLabelsApi,
} from "../../../api";
import { useAttributeApi } from "../../../api";
import { Helmet } from "react-helmet";
import {
  DeleteAttributeDialog,
  DeleteAttributeDialogOptions,
} from "../../../components";

export const AttributeDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [labelsQueryParams, setLabelsQueryParams] = useState<LabelsQueryParams>(
    location.state?.labelParams || {
      limit: 10,
      offset: 0,
    }
  );

  const [loadedLabels, setLoadedLabels] = useState<Label[]>([]);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const labelsApi = useLabelsApi(labelsQueryParams);

  const attributeApi = useAttributeApi(params.id ? params.id : "");

  const attributeDeleteApi = useAttributeDeleteApi();

  const allLabels = useCallback(() => {
    if (!labelsApi.data) return;
    setLoadedLabels(labelsApi.data.pages.flatMap((page) => page.data));
  }, [labelsApi.data]);

  const deleteAttribute = (id: string) => {
    if (!id) {
      return;
    }
    attributeDeleteApi.mutate({
      id,
      params: location.state.attributesQueryParams,
    });
  };

  const [snackBarOpen, setSnackBarOpen] = useState<string | undefined>(
    undefined
  );

  const proceedDialogActions = (option: DeleteAttributeDialogOptions) => {
    switch (option.id) {
      case 1: {
        if (!itemToDelete) {
          return;
        }
        deleteAttribute(itemToDelete);
        setItemToDelete(null);
        setSnackBarOpen(attributeApi.data?.data.name);

        break;
      }
      default: {
        setItemToDelete(null);
      }
    }
  };

  const onSnackBarClose = () => {
    setSnackBarOpen(undefined);
    navigate("/attributes", { state: location.state });
  };

  useEffect(() => {
    const goBack = () => {
      window.removeEventListener("popstate", goBack);
      navigate("/attributes", { state: location.state, replace: true });
    };
    window.onpopstate = () => goBack;
  });

  const showLabels = () => {
    const attributeLabels: (string | undefined)[] = [];
    attributeApi.data?.data.labelIds.forEach((labelId: string) => {
      attributeLabels.push(
        loadedLabels.find((label) => Number(label.id) === Number(labelId))?.name
      );
    });

    return attributeLabels.map((el, i) => (
      <Chip key={i} variant="outlined" label={el} sx={{ marginRight: 1 }} />
    ));
  };

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
    allLabels();
  }, [allLabels, labelsApi.data]);

  return (
    <>
      {attributeApi.data && (
        <Helmet>
          <title>{attributeApi.data?.data.name} | Meiro Frontend task</title>
        </Helmet>
      )}
      <Link to="/attributes" state={location.state} replace={true}>
        <Typography variant="h2">Attributes</Typography>
      </Link>
      <Typography variant="h1" sx={{ marginBottom: 2 }}>
        {attributeApi.data?.data.name}
      </Typography>
      {showLabels()}
      {attributeApi.data && (
        <p>
          {new Date(attributeApi.data?.data.createdAt).toLocaleString("cs-CZ")}
          <br />
          <Button
            color="error"
            variant="contained"
            onClick={() => setItemToDelete(attributeApi.data?.data.id)}
          >
            Delete Attribute
          </Button>
        </p>
      )}

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
        onClose={onSnackBarClose}
      >
        <Alert
          onClose={onSnackBarClose}
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
