// Topic: Network Fundamentals, Network Types, Network Devices
const fundamentals = [
  {
    id: "FND-001",
    topic: "Network Fundamentals",
    subtopic: "Network Types",
    difficulty: "Easy",
    question:
      "A bank wants to connect all its computers within a single branch office located on one floor of a building. Which type of network is most appropriate?",
    options: ["LAN", "MAN", "WAN", "PAN"],
    correctAnswer: 0,
    explanation:
      "A LAN (Local Area Network) connects devices within a limited geographical area such as a single office, floor, or building, making it ideal for a single branch office.",
    incorrectExplanations: {
      1: "A MAN (Metropolitan Area Network) spans a city or large campus, connecting multiple buildings — too large a scope for one floor.",
      2: "A WAN (Wide Area Network) spans cities, countries, or continents, such as connecting all branches of a bank nationwide.",
      3: "A PAN (Personal Area Network) covers only a few meters, such as Bluetooth devices around one person.",
    },
    estimatedTime: 30,
    memoryTrick: "Think 'L' for LAN = Limited/Local space.",
    examTip: "Exam often gives a scenario and asks you to identify LAN/MAN/WAN/PAN by scale — always map scope to size.",
  },
  {
    id: "FND-002",
    topic: "Network Fundamentals",
    subtopic: "Network Types",
    difficulty: "Easy",
    question:
      "Which network type would connect the head office of a bank in Mumbai to its branches in Delhi, Chennai, and Kolkata?",
    options: ["LAN", "PAN", "WAN", "CAN"],
    correctAnswer: 2,
    explanation:
      "A WAN spans large geographical distances across cities or countries, exactly what is needed to interconnect branches in different cities. Banks commonly use leased lines, MPLS, or VPN over WAN.",
    incorrectExplanations: {
      0: "LAN is restricted to a single building or campus, not multiple cities.",
      1: "PAN covers only a few meters around an individual, far too small in scope.",
      3: "CAN (Campus Area Network) connects buildings within one campus, not separate cities.",
    },
    estimatedTime: 25,
    memoryTrick: null,
    examTip: "Banking WAN questions frequently reference MPLS/leased lines connecting branches to a data centre.",
  },
  {
    id: "FND-003",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Easy",
    question: "Which device operates at Layer 1 of the OSI model and simply regenerates and amplifies electrical signals?",
    options: ["Repeater", "Router", "Bridge", "Switch"],
    correctAnswer: 0,
    explanation:
      "A repeater is a Layer 1 device that receives a weakened signal, regenerates it, and retransmits it to extend the cable segment's reach without interpreting any addressing information.",
    incorrectExplanations: {
      1: "A router works at Layer 3, forwarding packets based on IP addresses, not merely regenerating signals.",
      2: "A bridge works at Layer 2, forwarding frames based on MAC addresses to segment collision domains.",
      3: "A switch is a multiport Layer 2 device that forwards frames intelligently using MAC address tables.",
    },
    estimatedTime: 25,
    memoryTrick: "Repeater = Re-peat the signal, no intelligence involved.",
    examTip: "OSI-layer-to-device mapping is a guaranteed question type — memorise the layer for each device.",
  },
  {
    id: "FND-004",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Moderate",
    question:
      "A network administrator wants a device that can connect two different networks, choose the best path for data, and operate primarily at Layer 3. Which device should be used?",
    options: ["Hub", "Router", "Switch", "Access Point"],
    correctAnswer: 1,
    explanation:
      "A router operates at the Network layer (Layer 3) and uses IP addressing along with routing tables/protocols to determine the best path to forward packets between different networks.",
    incorrectExplanations: {
      0: "A hub is a Layer 1 device that simply broadcasts signals to all ports without any addressing intelligence.",
      2: "A switch primarily operates at Layer 2 using MAC addresses within a single network segment (Layer 3 switches exist but are not implied here).",
      3: "An access point provides wireless connectivity to a wired network and operates mainly at Layer 2.",
    },
    estimatedTime: 35,
    memoryTrick: "Router = Route between networks = Layer 3.",
    examTip: "Watch for trick options like 'Layer 3 switch' vs plain 'switch' — read carefully.",
  },
  {
    id: "FND-005",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Moderate",
    question:
      "Which device combines the functions of a switch and router, and is commonly used in modern enterprise networks to route traffic between VLANs at wire speed using hardware-based switching?",
    options: ["Gateway", "Layer 3 Switch", "Bridge", "Hub"],
    correctAnswer: 1,
    explanation:
      "A Layer 3 switch performs both Layer 2 switching and Layer 3 routing in hardware (using ASICs), enabling fast inter-VLAN routing without the latency of a traditional software-based router.",
    incorrectExplanations: {
      0: "A gateway connects networks using different protocols/architectures (e.g., translating between different network stacks), not specifically inter-VLAN routing.",
      2: "A bridge only segments collision domains at Layer 2 and cannot route between IP subnets/VLANs.",
      3: "A hub is a simple signal repeater with no switching or routing capability.",
    },
    estimatedTime: 35,
    memoryTrick: null,
    examTip: "Layer 3 switches are a favourite exam trap — remember they route in hardware, unlike traditional routers.",
  },
  {
    id: "FND-006",
    topic: "Network Fundamentals",
    subtopic: "Topologies",
    difficulty: "Easy",
    question:
      "In which network topology does every device connect to a central device, so that failure of one cable affects only that device while failure of the central device brings down the whole network?",
    options: ["Bus", "Ring", "Star", "Mesh"],
    correctAnswer: 2,
    explanation:
      "In a star topology, all nodes connect individually to a central hub or switch. A single cable failure isolates only that node, but the central device is a single point of failure.",
    incorrectExplanations: {
      0: "In bus topology, all devices share one central cable (backbone); a break anywhere can disrupt the entire segment.",
      1: "In ring topology, devices are connected in a closed loop; a single break can disrupt the whole ring unless it is dual-ring.",
      3: "In mesh topology, devices connect to many/all others directly, offering high redundancy with no single point of failure.",
    },
    estimatedTime: 25,
    memoryTrick: "Star = central 'sun' (hub/switch) with rays (cables) to each device.",
    examTip: "Topology questions often test the single-point-of-failure concept — star's weakness is the central device.",
  },
  {
    id: "FND-007",
    topic: "Network Fundamentals",
    subtopic: "Topologies",
    difficulty: "Moderate",
    question:
      "For n devices in a fully connected mesh topology, how many total point-to-point links are required?",
    options: ["n", "n(n-1)", "n(n-1)/2", "2n"],
    correctAnswer: 2,
    explanation:
      "In a full mesh, each device connects directly to every other device. The number of unique links is a combination of n devices taken 2 at a time: n(n-1)/2.",
    incorrectExplanations: {
      0: "n links would only connect devices in a simple ring or minimal chain, not a full mesh.",
      1: "n(n-1) counts each link twice (once from each direction) — it is double the actual number of unique physical links.",
      3: "2n has no basis in mesh link calculation formulas.",
    },
    estimatedTime: 40,
    memoryTrick: "Same formula as 'handshakes in a room of n people' = n(n-1)/2.",
    examTip: "This exact formula-based question appears frequently — memorise it, don't derive it under time pressure.",
  },
  {
    id: "FND-008",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Moderate",
    question:
      "Which device is used to interconnect networks that use different protocols or architectures, performing protocol translation, such as connecting a bank's IP network to an older SNA mainframe network?",
    options: ["Router", "Gateway", "Switch", "Modem"],
    correctAnswer: 1,
    explanation:
      "A gateway operates potentially at all OSI layers and translates between differing protocol stacks or network architectures, enabling communication between otherwise incompatible systems.",
    incorrectExplanations: {
      0: "A router forwards IP packets between networks using the same protocol family; it does not translate between fundamentally different architectures.",
      2: "A switch forwards frames within the same Layer 2 network based on MAC addresses.",
      3: "A modem modulates/demodulates signals to carry digital data over analog lines; it does not perform protocol translation.",
    },
    estimatedTime: 35,
    memoryTrick: "Gateway = 'gate' between two different worlds/protocols.",
    examTip: "Banking exams like referencing legacy mainframe interconnection scenarios — gateway is the usual answer.",
  },
  {
    id: "FND-009",
    topic: "Network Fundamentals",
    subtopic: "Transmission Modes",
    difficulty: "Easy",
    question: "Which transmission mode allows data to flow in both directions but only one direction at a time, as in a walkie-talkie?",
    options: ["Simplex", "Half-duplex", "Full-duplex", "Multiplex"],
    correctAnswer: 1,
    explanation:
      "Half-duplex allows two-way communication, but only one party can transmit at any given moment while the other must listen — exactly how walkie-talkies operate.",
    incorrectExplanations: {
      0: "Simplex allows communication in only one direction, e.g., a keyboard sending data to a CPU.",
      2: "Full-duplex allows simultaneous two-way communication, like a telephone call.",
      3: "Multiplexing is a technique to combine multiple signals over one channel, not a directional transmission mode.",
    },
    estimatedTime: 20,
    memoryTrick: "Half-duplex = 'half' the time you talk, 'half' the time you listen.",
    examTip: "Simplex/half/full-duplex is a very common one-mark direct question.",
  },
  {
    id: "FND-010",
    topic: "Network Fundamentals",
    subtopic: "Data Transmission",
    difficulty: "Moderate",
    question:
      "Bandwidth of a noiseless channel is 4 kHz and it can support 4 discrete signal levels. According to the Nyquist theorem, what is the maximum theoretical bit rate?",
    options: ["4,000 bps", "8,000 bps", "16,000 bps", "2,000 bps"],
    correctAnswer: 2,
    explanation:
      "Nyquist's formula for a noiseless channel is Bit Rate = 2 × Bandwidth × log2(L), where L is the number of discrete signal levels. Substituting: 2 × 4000 × log2(4) = 2 × 4000 × 2 = 16,000 bps.",
    incorrectExplanations: {
      0: "This equals just the bandwidth itself, ignoring both the factor of 2 and the log2(L) term entirely.",
      1: "This applies only the factor of 2 (2 × bandwidth) but forgets to multiply by log2(L) = 2 for 4 signal levels.",
      3: "This is half the bandwidth, which has no basis in the Nyquist formula at all.",
    },
    estimatedTime: 60,
    memoryTrick: "Nyquist: Bit rate = 2 × B × log2(L). Shannon (with noise) uses SNR instead of levels.",
    examTip: "Always distinguish Nyquist (noiseless, discrete levels) from Shannon (noisy, SNR-based) formulas — both are calculation favourites.",
  },
  {
    id: "FND-011",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Hard",
    question:
      "A network engineer observes that a hub-based LAN segment suffers heavy collisions as more devices are added. Replacing the hub with a switch improves performance primarily because:",
    options: [
      "The switch increases the physical cable length allowed",
      "The switch creates a separate collision domain per port",
      "The switch removes the need for MAC addresses",
      "The switch converts the LAN into a WAN",
    ],
    correctAnswer: 1,
    explanation:
      "A switch forwards frames intelligently to only the destination port based on the MAC address table, so each port is its own collision domain, drastically reducing collisions compared to a hub where all ports share one collision domain.",
    incorrectExplanations: {
      0: "Cable length limits are governed by the physical medium standard (e.g., Ethernet cabling specs), not by switching vs. hubs.",
      2: "Switches rely heavily on MAC addresses to build their forwarding table — they do not eliminate the need for them.",
      3: "Switching does not change the geographic scope of the network from LAN to WAN.",
    },
    estimatedTime: 40,
    memoryTrick: "Hub = 1 collision domain for all ports. Switch = 1 collision domain PER port.",
    examTip: "Collision domain vs. broadcast domain distinction is a high-frequency exam concept — switches reduce collision domains but not broadcast domains (unless VLANs are used).",
  },
  {
    id: "FND-012",
    topic: "Network Fundamentals",
    subtopic: "Broadcast & Collision Domains",
    difficulty: "Hard",
    question:
      "Which statement correctly compares broadcast domains and collision domains on a network built with an unmanaged switch (no VLANs)?",
    options: [
      "A switch reduces both collision domains and broadcast domains",
      "A switch reduces collision domains per port but all ports remain in a single broadcast domain",
      "A switch increases collision domains but reduces broadcast domains",
      "A switch has no effect on either domain type",
    ],
    correctAnswer: 1,
    explanation:
      "Each switch port is its own collision domain, but without VLAN segmentation, broadcast traffic (e.g., ARP requests) is still flooded to every port, so the entire switch remains one broadcast domain.",
    incorrectExplanations: {
      0: "The switch does not reduce broadcast domains without VLANs — broadcasts still reach every port.",
      2: "A switch reduces (not increases) collision domains per port compared to a hub.",
      3: "A switch definitely changes collision domain behaviour, even without VLANs.",
    },
    estimatedTime: 45,
    memoryTrick: "Routers break broadcast domains; switches (without VLANs) break only collision domains.",
    examTip: "This concept is frequently tested with 'routers stop broadcasts, switches don't' as the key takeaway.",
  },
  {
    id: "FND-013",
    topic: "Network Fundamentals",
    subtopic: "Cabling",
    difficulty: "Easy",
    question: "Which cable type is most resistant to electromagnetic interference (EMI) and supports the longest transmission distances without a repeater?",
    options: ["Twisted pair (UTP)", "Coaxial cable", "Fiber optic cable", "Ribbon cable"],
    correctAnswer: 2,
    explanation:
      "Fiber optic cable transmits data as light pulses rather than electrical signals, making it immune to EMI and capable of much longer distances (kilometers) than copper media.",
    incorrectExplanations: {
      0: "UTP is highly susceptible to EMI and limited to about 100 meters per segment.",
      1: "Coaxial cable has better EMI resistance than UTP but far less than fiber, and shorter range than fiber.",
      3: "Ribbon cable is used for short internal connections (e.g., older IDE drives), not for long-distance networking.",
    },
    estimatedTime: 20,
    memoryTrick: "Fiber = light, not electricity → immune to electromagnetic noise.",
    examTip: "Banking data centres commonly use fiber backbones — expect scenario questions on this.",
  },
  {
    id: "FND-014",
    topic: "Network Fundamentals",
    subtopic: "Cabling",
    difficulty: "Moderate",
    question: "Which UTP cable category is the minimum required to reliably support Gigabit Ethernet (1000BASE-T) over 100 meters?",
    options: ["Cat3", "Cat5", "Cat5e", "Cat2"],
    correctAnswer: 2,
    explanation:
      "Cat5e (enhanced Category 5) is specified to reliably support Gigabit Ethernet speeds (1000 Mbps) over the standard 100-meter run, with improved crosstalk performance over plain Cat5.",
    incorrectExplanations: {
      0: "Cat3 supports only up to 10 Mbps (10BASE-T), far below gigabit requirements.",
      1: "Plain Cat5 is only officially rated for 100 Mbps (Fast Ethernet), though it sometimes works unreliably at gigabit speeds.",
      3: "Cat2 is an obsolete standard used for older telephone/low-speed data, well below Ethernet requirements.",
    },
    estimatedTime: 30,
    memoryTrick: "Cat5e = 'e' for enhanced = enough for gigabit Ethernet.",
    examTip: "Memorise: Cat3=10Mbps, Cat5=100Mbps, Cat5e/Cat6=1000Mbps+, Cat6a/Cat7=10Gbps.",
  },
  {
    id: "FND-015",
    topic: "Network Fundamentals",
    subtopic: "Network Devices",
    difficulty: "Moderate",
    question: "What is the primary function of a proxy server in a corporate/banking network?",
    options: [
      "It assigns IP addresses dynamically to hosts",
      "It acts as an intermediary between client requests and external servers, providing caching, filtering, and anonymity",
      "It converts digital signals to analog for transmission over phone lines",
      "It physically amplifies weak signals on long cable runs",
    ],
    correctAnswer: 1,
    explanation:
      "A proxy server sits between internal clients and the internet, forwarding requests on their behalf. It can cache frequently accessed content, enforce content filtering/security policies, and mask internal client IP addresses.",
    incorrectExplanations: {
      0: "Dynamic IP assignment is the job of a DHCP server, not a proxy.",
      2: "Digital-to-analog conversion for phone lines is the function of a modem.",
      3: "Signal amplification on cable runs is the function of a repeater.",
    },
    estimatedTime: 30,
    memoryTrick: "Proxy = 'stand-in' — it stands in between you and the internet.",
    examTip: "Banks use proxies heavily for content filtering and security compliance — a common scenario topic.",
  },
];

export default fundamentals;
