import React, {
    useState,
    useEffect,
    useCallback
} from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import axios from 'axios';

const DailyBlockCounts = ({
    data
}) => {
    return ( <
        ResponsiveContainer width = "100%"
        height = {
            300
        } >
        <
        LineChart data = {
            data
        }
        margin = {
            {
                top: 5,
                right: 20,
                left: 10,
                bottom: 5
            }
        } >
        <
        CartesianGrid strokeDasharray = "3 3" / >
        <
        XAxis dataKey = "date" / >
        <
        YAxis / >
        <
        Tooltip / >
        <
        Legend / >
        <
        Line type = "monotone"
        dataKey = "count"
        stroke = "#8884d8"
        activeDot = {
            {
                r: 8
            }
        }
        /> < /
        LineChart > <
        /ResponsiveContainer>
    );
};

// Adjustments made here for clarity and direct initialization
const App = () => {
    const [data, setData] = useState([]); // Holds the original fetched data
    const [filteredData, setFilteredData] = useState([]); // Holds data filtered by time range

    // Function to fetch and initially filter data
    const fetchDataAndFilter = async () => {
        try {
            const response = await axios.post('https://graphql.bitquery.io', {
                query: `
                    query {
                        bitcoin {
                            blocks(options: {desc: "date.date", limit: 1900}) {
                                date {
                                    date
                                }
                                count
                            }
                        }
                    }
                `,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'BQY5zH8uvBQ1h2sMZXogQTnkKc2Hk9QA', // Replace with your actual API Key
                }
            });

            const fetchedData = response.data.data.bitcoin.blocks.map(block => ({
                date: block.date.date,
                count: block.count
            }));

            setData(fetchedData.reverse());
            filterDataByRange(fetchedData, '1M'); // Directly filter for 1M data on fetch
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Function to filter data by time range
    const filterDataByRange = (inputData, range) => {
        const endDate = moment();
        let startDate;

        switch(range) {
            case '1M':
                startDate = endDate.clone().subtract(1, 'months');
                break;
            case '3M':
                startDate = endDate.clone().subtract(3, 'months');
                break;
            case '1Y':
                startDate = endDate.clone().subtract(1, 'years');
                break;
            case '3Y':
                startDate = endDate.clone().subtract(3, 'years');
                break;
            case '5Y':
                startDate = endDate.clone().subtract(5, 'years');
                break;
            default:
                startDate = endDate.clone().subtract(1, 'months');
        }

        const result = inputData.filter(({ date }) => {
            const dateMoment = moment(date, 'YYYY-MM-DD');
            return dateMoment.isBetween(startDate, endDate, undefined, '[]');
        });

        setFilteredData(result);
    };

    // Effect to fetch and set data on component mount
    useEffect(() => {
        fetchDataAndFilter();
    }, []);

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <h2>Daily Block Counts</h2>
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <button onClick={() => filterDataByRange(data, '1M')}>1M</button>
                <button onClick={() => filterDataByRange(data, '3M')}>3M</button>
                <button onClick={() => filterDataByRange(data, '1Y')}>1Y</button>
                <button onClick={() => filterDataByRange(data, '3Y')}>3Y</button>
                <button onClick={() => filterDataByRange(data, '5Y')}>5Y</button>
            </div>
            <DailyBlockCounts data={filteredData} />
            <p>Update time: {moment().format('YYYY-MM-DD')}</p>
        </div>
    );
};

export default App;
