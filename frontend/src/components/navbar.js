import * as React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { green } from '@mui/material/colors';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TranslateIcon from '@mui/icons-material/Translate';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    'aria-controls': `action-tabpanel-${index}`,
  };
}

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

const fabGreenStyle = {
  color: 'common.white',
  bgcolor: green[500],
  '&:hover': {
    bgcolor: green[600],
  },
};

export default function Navbar(props) {
  const { content } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/home");
        break;
      case 1:
        navigate("/create");
        break;
      case 2:
        navigate("/list");
        break;
      case 3:
        navigate("/transcribe");
        break;
      case 4:
        navigate("/summarize-document");
        break;
      case 5:
        navigate("/summarize-text");
        break;
      case 6:
        navigate("/listsum");
        break;
      case 7:
        navigate("/speech_to_text");
        break;
      default:
        break;
    }
  };

  const transitionDuration = {
    enter: 225,
    exit: 195,
  };

  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', borderBottom: '1px solid blue' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="nav tabs"
          sx={{ color: 'blue' }} // Set text color to blue
        >
          <Tab label="Trang chủ" icon={<HomeIcon />} {...a11yProps(0)} />
          <Tab label="Tạo cuộc họp" icon={<AddBoxIcon />} {...a11yProps(2)} />
          <Tab label="Danh sách cuộc họp" icon={<ListAltIcon />} {...a11yProps(3)} />
          <Tab label="Chuyển đổi" icon={<TranslateIcon />} {...a11yProps(4)} />
          <Tab label="Tóm tắt tài liệu" icon={<EventNoteIcon />} {...a11yProps(5)} />
          <Tab label="Tóm tắt văn bản" icon={<EventNoteIcon />} {...a11yProps(6)} />
          <Tab label="Danh sách bản tóm tắt" icon={<FormatListBulletedIcon />} {...a11yProps(7)} />
          <Tab label="Chuyển đổi voice" icon={<SpeakerNotesIcon />} {...a11yProps(8)} />
        </Tabs>
      </AppBar>

      {/* <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <TabPanel value={value} index={0}>

        </TabPanel>
        <TabPanel value={value} index={1}>

        </TabPanel>
        <TabPanel value={value} index={2}>

        </TabPanel>
        <TabPanel value={value} index={3}>

        </TabPanel>
        <TabPanel value={value} index={4}>

        </TabPanel>
        <TabPanel value={value} index={5}>

        </TabPanel>
        <TabPanel value={value} index={6}>

        </TabPanel>
        <TabPanel value={value} index={7}>

        </TabPanel>

      </Box> */}

      
    </Box>
  );
}
