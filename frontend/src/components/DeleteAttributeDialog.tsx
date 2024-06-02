import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DeleteAttributeDialogProps {
    title: string;
    text: string;
    options:DeleteAttributeDialogOptions[];
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (option: DeleteAttributeDialogOptions) => void;
}

export type DeleteAttributeDialogOptions = {
    id: number;
    buttonText: string;
    color? : "primary" | "secondary" | "error" | "inherit" | "success" | "info" | "warning" | undefined;
};

export function DeleteAttributeDialog({
    isOpen,
    title,
    text,
    options,
    onClose,
    onConfirm
}: DeleteAttributeDialogProps) {
    return (
            <Dialog
                open={isOpen}
                onClose={onClose}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{text}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {options.map((option) => (
                        <Button key={option.id} onClick={() => onConfirm(option)} color={option.color}>
                            {option.buttonText}
                        </Button>
                    ))}
                </DialogActions>
            </Dialog>
    );
}
