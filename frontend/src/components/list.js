import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "./axios";
import { MaterialReactTable } from 'material-react-table';
import Dayjs from "dayjs";
import { Box, IconButton, TextField, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const List = () => {
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(""); // State for search input (MSSV or Department)
    const [userRole, setUserRole] = useState(""); // State for user role
    const [isMSSVEntered, setIsMSSVEntered] = useState(false); // Track if MSSV has been entered

    // Function to fetch data based on role and search input
    const getData = async (filter = "") => {
        setLoading(true);

        try {
            // Fetch meetings data
            const projectsResponse = await AxiosInstance.get('project/');
            let filteredData = projectsResponse.data;

            if (userRole === '0') {
                // If user is admin, show all meetings
                setMyData(filteredData);
            } else if (filter) {
                // Filter data based on department code (non-admin users)
                filteredData = filteredData.filter(item =>
                    item.num_depart.toLowerCase() === filter.toLowerCase()
                );
                setMyData(filteredData);
            } else {
                // Clear data if no matching role or filter
                setMyData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (searchInput.trim() !== "") {
                try {
                    // Check if input is an MSSV (e.g., format starts with "b" followed by digits)
                    if (/^b\d{3,}$/.test(searchInput)) {
                        // Fetch user role based on MSSV
                        const usersResponse = await AxiosInstance.get('users/select_role/');
                        const user = usersResponse.data.find(u => u.mssv === searchInput);
                        if (user) {
                            setUserRole(user.role); // Set the role for the entered MSSV
                            setIsMSSVEntered(true); // Mark MSSV as entered
                            await getData(); // Fetch all data for admin
                        } else {
                            setUserRole("");
                            setIsMSSVEntered(false); // Reset MSSV entry
                            setMyData([]); // Clear data if MSSV invalid
                        }
                    } else {
                        // Assume it's a department code
                        await getData(searchInput); // Fetch data based on department
                    }
                } catch (error) {
                    console.error("Error fetching user role or data:", error);
                }
            } else if (userRole === '0') {
                // Fetch data if MSSV is not entered but user is admin
                await getData();
            }
        };

        fetchData();
    }, [searchInput, userRole]);

    const handleSearch = async () => {
        if (userRole === '0') {
            // console.log(searchInput)
            await getData();
            setUserRole('1');
            return;
        } else {
            // console.log("hi", searchInput)
            getData(searchInput);

        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'meeting_name',
                header: 'Meeting name',
                size: 150,
            },
            {
                accessorKey: 'meeting_link',
                header: 'Meeting link',
                size: 150,
            },
            {
                accessorKey: 'num_depart',
                header: 'Department',
                size: 150,
            },
            {
                accessorFn: (row) => Dayjs(row.start_date).format('DD-MM-YYYY'),
                header: 'Start date',
                size: 200,
            },
            {
                accessorFn: (row) => Dayjs(row.end_date).format('DD-MM-YYYY'),
                header: 'End date',
                size: 150,
            },
            {
                accessorKey: 'start_time',
                header: 'Start time',
                size: 150,
            },
            {
                accessorKey: 'end_time',
                header: 'End time',
                size: 150,
            },
        ],
        [],
    );

    return (
        <div style={{
           marginTop: '100px'
        }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    placeholder="Nhập mã bộ phận ..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    variant="outlined"
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                >
                    Tìm kiếm
                </Button>
            </Box>
            {loading ? (
                <p>Loading data...</p>
            ) : myData.length > 0 ? (
                <MaterialReactTable
                    columns={columns}
                    data={myData}
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                            <IconButton color="secondary" component={Link} to={`edit/${row.original.meeting_name}`}>
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" component={Link} to={`delete/${row.original.meeting_name}`}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                />
            ) : (
                <p>Không có dữ liệu phù hợp.</p>
            )}
        </div>
    );
};

export default List;
