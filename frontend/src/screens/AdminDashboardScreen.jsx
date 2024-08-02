import React, { useContext, useEffect, useReducer, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                summary: action.payload,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};


const SalesChart = ({ data }) => {
    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current)
            .attr('width', 800)
            .attr('height', 400);

        const margin = { top: 20, right: 30, bottom: 30, left: 40 },
            width = +svg.attr('width') - margin.left - margin.right,
            height = +svg.attr('height') - margin.top - margin.bottom;

        const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        const y = d3.scaleLinear().rangeRound([height, 0]);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        x.domain(data.map(d => new Date(d._id)));
        y.domain([0, d3.max(data, d => d.sales)]);

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d')));

        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y));

        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(new Date(d._id)))
            .attr('y', d => y(d.sales))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.sales))
            .attr('fill', 'darkblue'); // Set bar color to dark blue

        g.selectAll('.label')
            .data(data)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(new Date(d._id)) + x.bandwidth() / 2)
            .attr('y', d => y(d.sales) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d.sales);

    }, [data]);

    return <svg ref={ref}></svg>;
};


const CategoriesChart = ({ data }) => {
    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current)
            .attr('width', 800)
            .attr('height', 400)
            .append('g')
            .attr('transform', 'translate(400,200)');

        const radius = Math.min(800, 400) / 2;

        const pie = d3.pie()
            .value(d => d.count)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const path = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data._id));

        svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data._id);

    }, [data]);

    return <svg ref={ ref }> </svg>;
};

export default function AdminDashboardScreen() {
    const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get('/api/orders/summary', {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };
        fetchData();
    }, [userInfo]);

    return (
        <div>
        <h1>Dashboard </h1>
      {
        loading ? (
            <LoadingBox />
        ) : error ? (
            <MessageBox variant= "danger" > { error } </MessageBox>
      ) : (
            <>
            <Row>
            <Col md= { 4} >
            <Card>
            <Card.Body>
            <Card.Title>
            {
                summary.users && summary.users[0]
                    ? summary.users[0].numUsers
                    : 0
            }
            </Card.Title>
            < Card.Text > Users </Card.Text>
            </Card.Body>
            </Card>
            </Col>
            < Col md = { 4} >
                <Card>
                <Card.Body>
                <Card.Title>
                {
                    summary.orders && summary.users[0]
                        ? summary.orders[0].numOrders
                        : 0
                }
                </Card.Title>
                < Card.Text > Orders </Card.Text>
                </Card.Body>
                </Card>
                </Col>
                < Col md = { 4} >
                    <Card>
                    <Card.Body>
                    <Card.Title>
                    $
        {
            summary.orders && summary.users[0]
            ? summary.orders[0].totalSales.toFixed(2)
            : 0
        }
        </Card.Title>
            < Card.Text > Sales </Card.Text>
            </Card.Body>
            </Card>
            </Col>
            </Row>
            < div className = "my-3" >
                <h2>Sales </h2>
        {
            summary.dailyOrders.length === 0 ? (
                <MessageBox>No Sale </MessageBox>
            ) : (
                <SalesChart data= { summary.dailyOrders } />
            )
        }
        </div>
            < div className = "my-3" >
                <h2>Categories </h2>
        {
            summary.productCategories.length === 0 ? (
                <MessageBox>No Category </MessageBox>
            ) : (
                <CategoriesChart data= { summary.productCategories } />
            )
        }
        </div>
            </>
      )
    }
    </div>
  );
}
