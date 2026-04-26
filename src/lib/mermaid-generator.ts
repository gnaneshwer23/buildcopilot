import { RequirementsPack } from "./buildcopilot-types";

export function generateMermaidFromRequirements(requirements: RequirementsPack): string {
  const { prd, frd } = requirements;
  
  let mermaidCode = "flowchart TD\n";
  
  // Styling
  mermaidCode += "  classDef default fill:#121821,stroke:#334155,color:#cbd5e1,stroke-width:1px;\n";
  mermaidCode += "  classDef feature fill:#1e293b,stroke:#3b82f6,color:#fff,stroke-width:2px;\n";
  mermaidCode += "  classDef requirement fill:#0f172a,stroke:#64748b,color:#94a3b8,stroke-width:1px,stroke-dasharray: 5 5;\n";
  mermaidCode += "  classDef start fill:#1e3a8a,stroke:#60a5fa,color:#fff,stroke-width:2px;\n";

  // Start node
  mermaidCode += `  Start([${prd.title}])\n`;
  mermaidCode += `  class Start start;\n`;
  mermaidCode += `  Start --> Features{Core Features}\n`;
  
  // Features to Functional Requirements
  prd.features.forEach((feature, index) => {
    const featureId = `F${index}`;
    mermaidCode += `  ${featureId}[${feature}]\n`;
    mermaidCode += `  class ${featureId} feature;\n`;
    mermaidCode += `  Features --> ${featureId}\n`;
    
    // Link to functional requirements
    frd.functionalRequirements.forEach((req) => {
      const isMatch = req.text.toLowerCase().includes(feature.toLowerCase().split(' ')[0]) || index === 0;
      if (isMatch) {
        mermaidCode += `  ${featureId} -.-> ${req.id}(${req.id})\n`;
        mermaidCode += `  class ${req.id} requirement;\n`;
      }
    });
  });

  // Release plan nodes
  if (prd.releasePlan && prd.releasePlan.length > 0) {
    mermaidCode += `  subgraph ReleasePlan [Delivery Roadmap]\n`;
    prd.releasePlan.forEach((step, index) => {
      mermaidCode += `    R${index}[${step}]\n`;
      if (index > 0) {
        mermaidCode += `    R${index-1} ===> R${index}\n`;
      }
    });
    mermaidCode += `  end\n`;
    mermaidCode += `  Features --> ReleasePlan\n`;
  }

  return mermaidCode;
}
