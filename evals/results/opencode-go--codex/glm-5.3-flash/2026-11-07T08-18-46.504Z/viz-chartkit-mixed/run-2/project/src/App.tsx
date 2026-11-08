import {VisualizationWidget} from './visualization/VisualizationWidget';
import {visualizationData} from './visualization/data';
import './visualization/visualization.css';

export function App() {
  return (
    <div style={{padding: 24}}>
      <VisualizationWidget data={visualizationData} mode="sales" />
    </div>
  );
}
