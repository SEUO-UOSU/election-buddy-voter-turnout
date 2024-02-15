import { useEffect, useMemo, useState } from "react";
import uosu from "./assets/uosu.svg";
import ge from "./assets/ge.svg";
import "./App.css";

const CORS = "https://cors.arcanist.workers.dev/";
const URL = "https://secure.electionbuddy.com/widget/JRL2D6SJT62K.js";
const APPENDIX = `window.r = r;`;

type ElectionData = {
	election_name: string;
	spoiled_ballot_count: number;
	submitted_ballot_count: number;
	pluralized_submitted_ballot_count: string;
	pluralized_eligible_voter_count: string;
	ballot_count_percentage: string;
};

function App() {
	const [data, setData] = useState<ElectionData | null>(null);

	const turnout = useMemo(() => {
		if (!data) return "Loading...";
		const votes = parseInt(data.pluralized_submitted_ballot_count);
		const voters = parseInt(data.pluralized_eligible_voter_count);
		return data ? `${((votes / voters) * 100).toFixed(2)}%` : "Loading...";
	}, [data]);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`${CORS}${URL}`);
			const wrapped = await response.text();
			const script = wrapped.slice(2, -2).split("\n")[0];
			new Function(`${script}${APPENDIX}`)();
			if ("r" in window) {
				const r = window.r as ElectionData;
				r.pluralized_submitted_ballot_count = r.pluralized_submitted_ballot_count.replace(" ballots", "");
				r.pluralized_eligible_voter_count = r.pluralized_eligible_voter_count.replace(" eligible voters", "");
				setData(r);
			} else {
				console.error("Failed to load script");
			}
		};

		if (!data) fetchData();

		const interval = setInterval(fetchData, 3000);

		return () => clearInterval(interval);
	});

	return (
		<>
			<div
				className="blob"
				style={{
					backgroundColor: "#FFC268",
					width: "60vmin",
					top: "-10vmin",
					left: "-5vmin",
				}}
			></div>
			<div
				className="blob"
				style={{
					backgroundColor: "#7380D8",
					width: "60vmin",
					right: "-20vmin",
					top: "20vmin",
				}}
			></div>
			<div
				className="blob"
				style={{
					backgroundColor: "#73B4D8",
					width: "45vmin",
					bottom: "-5vmin",
					left: "-5vmin",
				}}
			></div>
			{data ? (
				<>
					<img src={ge} alt="Élections générales 2024 General Elections" />
					<div className="group">
						<h1>Participation électorale</h1>
						<h1>Voter turnout</h1>
					</div>
					<div className="group">
						<p>{turnout}</p>
						<small>
							{data.pluralized_submitted_ballot_count} / {data.pluralized_eligible_voter_count}
						</small>
					</div>
					<img
						src={uosu}
						width={400}
						alt="Syndicat étudiant de l'Université d'Ottawa | University of Ottawa Students' Union"
					/>
				</>
			) : (
				<p>Loading...</p>
			)}
		</>
	);
}

export default App;
