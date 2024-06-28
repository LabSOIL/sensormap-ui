// in src/Menu.js
import * as React from 'react';
import { Button, DashboardMenuItem, Menu, MenuItemLink } from 'react-admin';
import BookIcon from '@mui/icons-material/Book';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PeopleIcon from '@mui/icons-material/People';
import LabelIcon from '@mui/icons-material/Label';
import { Typography } from '@mui/material';

export const CustomMenu = () => (
    <Menu>
        <DashboardMenuItem />
        <MenuItemLink to="/posts" primaryText="Posts" leftIcon={<BookIcon />} />
        <MenuItemLink to="/comments" primaryText="Comments" leftIcon={<ChatBubbleIcon />} />
        <Button><Typography>Button</Typography></Button>
        <MenuItemLink to="/users" primaryText="Users" leftIcon={<PeopleIcon />} />
        <MenuItemLink to="/custom-route" primaryText="Miscellaneous" leftIcon={<LabelIcon />} />
    </Menu>
);

export default CustomMenu;