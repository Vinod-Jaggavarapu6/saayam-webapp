import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PiWarningDiamondFill } from "react-icons/pi";
import { TbTriangleSquareCircle } from "react-icons/tb";
import { VscCalendar } from "react-icons/vsc";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./RequestDescription.css";

const findCategoryLabel = (node, targetKey) => {
  if (!node || !targetKey) return null;

  for (const [key, value] of Object.entries(node)) {
    if (key === targetKey && value?.LABEL) return value.LABEL;

    if (value?.SUBCATEGORIES) {
      const found = findCategoryLabel(value.SUBCATEGORIES, targetKey);
      if (found) return found;
    }
  }

  return null;
};

const RequestDescription = ({ requestData, setIsEditing }) => {
  const { t, i18n } = useTranslation();
  const token = useSelector((state) => state.auth.idToken);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const cDate = new Date(requestData.creationDate);
  const formattedDate = cDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const categoriesBundle = i18n.hasResourceBundle?.(lang, "categories")
    ? i18n.getResourceBundle(lang, "categories")
    : i18n.getResourceBundle("en", "categories");
  const enumsBundle = i18n.hasResourceBundle?.(lang, "enums")
    ? i18n.getResourceBundle(lang, "enums")
    : i18n.getResourceBundle("en", "enums");

  const categoryLabel =
    findCategoryLabel(
      categoriesBundle?.REQUEST_CATEGORIES,
      requestData?.category,
    ) || requestData?.category;

  const statusKey = String(requestData?.status || "").toUpperCase();
  const priorityKey = String(requestData?.priority || "").toUpperCase();
  const statusLabel =
    enumsBundle?.requestStatus?.[statusKey] || t(statusKey) || statusKey;
  const priorityLabel =
    enumsBundle?.requestPriority?.[priorityKey] ||
    t(priorityKey) ||
    priorityKey;

  const tabTitle = (label) => {
    const tabMap = {
      Comments: t("COMMENTS") || t("Comments") || "Comments",
      Volunteers: t("VOLUNTEERS") || t("Volunteers") || "Volunteers",
      Details: t("DETAILS") || t("Details") || "Details",
    };

    return tabMap[label] || label;
  };

  const attributes = [
    {
      context: formattedDate,
      type: "Creation Date",
      icon: <VscCalendar size={22} />,
    },
    {
      context: categoryLabel,
      type: "Category",
      icon: <TbTriangleSquareCircle size={22} />,
    },
  ];

  const handleDeleteRequest = async () => {
    try {
      console.log("Deleting request:", requestData.id);
      console.log("Reason:", deleteReason);

      setDeleteDialogOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <>
      <div className="border border-gray-300 rounded-lg p-4">
        <div>
          <ul className="w-full flex flex-col sm:flex-row items-start flex-wrap md:gap-2 lg:gap-10 text-xs text-gray-700 sm:items-center justify-between">
            {attributes.map((header, index) => (
              <li key={index} className="flex items-center gap-2">
                {header.icon}
                {header.context}
              </li>
            ))}

            <li>
              <span className="bg-green-200 text-xs px-3 py-1 rounded-full">
                {statusLabel}
              </span>
            </li>

            <li className="flex items-center">
              <PiWarningDiamondFill className="mr-1 text-red-500" />
              <span className="font-bold">{priorityLabel}</span>
            </li>

            {/* Buttons */}
            <div className="flex gap-3 ml-auto">
              <button
                className="bg-blue-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => console.log("Change Volunteer clicked")}
              >
                {t("CHANGE_VOLUNTEER") ||
                  t("Change Volunteer") ||
                  "Change Volunteer"}
              </button>

              <button
                className="bg-red-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t("DELETE") || t("Delete") || "Delete"}
              </button>

              <button
                className="bg-blue-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => setIsEditing(true)}
              >
                {t("EDIT")}
              </button>
            </div>
          </ul>

          <div className="w-full m-0">
            <p className="text-sm p-5">{t(requestData.description)}</p>
          </div>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("DELETE") || t("Delete") || "Delete"}</DialogTitle>

        <DialogContent>
          <Typography>{t("REASON") || t("Reason") || "Reason"}</Typography>

          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="border p-2 w-full mt-3 rounded-lg min-h-[100px]"
            placeholder={t("REASON") || t("Reason") || "Reason"}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            {t("CANCEL") || t("Cancel") || "Cancel"}
          </Button>

          <Button
            onClick={handleDeleteRequest}
            color="error"
            variant="contained"
            disabled={!deleteReason.trim()}
          >
            {t("DELETE") || t("Delete") || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequestDescription;
