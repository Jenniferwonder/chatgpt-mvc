import { AppBar, Toolbar, Tooltip, IconButton } from "@mui/material";
import KeyPopper from "./KeyPopper";
import GitHubIcon from "@mui/icons-material/GitHub";


const TopBar = () => {

  return (
    <AppBar
      sx={{ bgcolor: "background.default", color: "text.primary" }}
      elevation={0}
      position="sticky"
    >
      <Toolbar>
        <Tooltip title="Source code" enterDelay={300}>
          <IconButton
            component="a"
            size="small"
            color="inherit"
            href="https://github.com/jenniferwonder/chatgpt-mvc"
            target="_blank"
            rel="noopener"
            sx={{
              mr: 1,
              borderRadius: 2,
            }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
        <KeyPopper />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
