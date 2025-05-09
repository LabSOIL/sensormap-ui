// In src/layout/Submenu.tsx
import React from "react";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

type SubmenuProps = {
    text: string,
    icon: React.ReactNode,
    children: React.ReactNode
}

const Submenu = ({ text, icon, children }: SubmenuProps) => {
    const [open, setOpen] = React.useState(true); // Set default state to true

    const handleClick = () => {
        setOpen(!open);
    };

    return <>
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                {open ? <ExpandLess /> : icon}
            </ListItemIcon>
            <ListItemText primary={text} />
        </MenuItem>
        <Collapse in={open} timeout="auto" unmountOnExit sx={{
            '& .RaMenuItemLink-icon': {
                paddingLeft: 1
            },
            '& .MuiCollapse-wrapperInner': {
                paddingLeft: 4 // Increase this value for more indentation
            }
        }}>
            {children}
        </Collapse>
    </>
}

export default Submenu;