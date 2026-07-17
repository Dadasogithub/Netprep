const scenarios = [
  {
    id: "SCN-001",
    topic: "Banking Network Concepts",
    subtopic: "Core Banking Connectivity",
    difficulty: "Hard",
    question:
      "A bank's Core Banking Solution (CBS) server is hosted at a central data centre, and all branches connect to it in real time to process transactions. If the WAN link to a branch fails, what is the most likely immediate operational impact, assuming no local fallback exists?",
    options: [
      "The branch can continue processing transactions normally with no impact",
      "The branch loses real-time access to the CBS and cannot process online transactions until connectivity is restored or a fallback (e.g., backup link) is used",
      "Only ATM withdrawals are affected; all other services continue normally",
      "The core banking data at the central data centre is permanently lost",
    ],
    correctAnswer: 1,
    explanation:
      "Since CBS operates on a centralized, real-time model, branches depend entirely on WAN connectivity to the data centre for transaction processing. A WAN failure without redundancy (like a backup MPLS/broadband link) halts real-time banking operations at that branch until the link is restored or failover occurs.",
    incorrectExplanations: {
      0: "Without connectivity to the centralized CBS, real-time transaction processing cannot continue normally — this ignores the centralized dependency.",
      2: "The impact affects ALL real-time services requiring CBS access, not just ATM withdrawals specifically.",
      3: "A WAN link failure affects connectivity/access, not the data itself, which remains safely stored at the data centre.",
    },
    estimatedTime: 45,
    memoryTrick: "CBS = centralized = branch is 'dumb terminal' dependent on WAN; no WAN, no real-time processing.",
    examTip: "Banks mitigate this exact risk with redundant WAN links (dual ISP/MPLS+broadband) — a common follow-up concept.",
  },
  {
    id: "SCN-002",
    topic: "Banking Network Concepts",
    subtopic: "ATM Networking",
    difficulty: "Hard",
    question: "ATMs typically communicate with the bank's switching server using which type of network connection, and what security measure is essential given the sensitive financial data transmitted?",
    options: [
      "A completely open, unencrypted public Wi-Fi connection with no security",
      "A dedicated or VPN-secured connection, often over leased lines/MPLS or encrypted VPN, using protocols with strong encryption for transaction data",
      "A Bluetooth connection paired directly to the user's smartphone",
      "No network connection is required; ATMs work entirely offline",
    ],
    correctAnswer: 1,
    explanation:
      "ATMs require secure, reliable connectivity to the bank's switching infrastructure — typically via dedicated leased lines, MPLS VPNs, or secured broadband/VPN connections — with encryption (e.g., using standards like triple DES or newer encryption for PIN/transaction data) to protect sensitive financial data in transit, in compliance with standards like PCI DSS.",
    incorrectExplanations: {
      0: "Open, unencrypted connections would expose sensitive financial and PIN data to interception, violating security standards like PCI DSS.",
      2: "Bluetooth pairing with a smartphone is not how ATMs connect to core banking switching infrastructure.",
      3: "ATMs require real-time network connectivity to authorize and process transactions against the core banking system; they do not function purely offline.",
    },
    estimatedTime: 45,
    memoryTrick: "ATM = 'always secure, always connected' — dedicated/VPN links with strong encryption, never open Wi-Fi.",
    examTip: "PCI DSS compliance keywords sometimes appear in ATM/payment security questions — familiarize yourself with the term even at a high level.",
  },
  {
    id: "SCN-003",
    topic: "Banking Network Concepts",
    subtopic: "Network Redundancy",
    difficulty: "Hard",
    question:
      "A bank's data centre uses two internet service providers with automatic failover for internet connectivity, and dual power supplies for critical servers. This design approach is best described as implementing:",
    options: [
      "Load balancing only",
      "Redundancy to eliminate single points of failure and improve high availability",
      "Network Address Translation for cost savings",
      "VLAN segmentation for security",
    ],
    correctAnswer: 1,
    explanation:
      "Using multiple ISPs with automatic failover and dual power supplies are both examples of redundancy — having backup components ready to take over automatically if a primary component fails — a core strategy for achieving high availability and eliminating single points of failure in critical banking infrastructure.",
    incorrectExplanations: {
      0: "Load balancing distributes traffic across active resources for performance; while related, the scenario specifically emphasizes failover/backup readiness, which is redundancy's defining characteristic.",
      2: "NAT is about address translation for internet connectivity, entirely unrelated to power supply or ISP redundancy design.",
      3: "VLAN segmentation is about logical traffic isolation for security/management, not about failover/backup infrastructure design.",
    },
    estimatedTime: 40,
    memoryTrick: "Redundancy = 'always have a backup ready' — no single point of failure.",
    examTip: "High availability (HA) design principles (redundancy, failover, no single point of failure) recur throughout banking infrastructure questions.",
  },
  {
    id: "SCN-004",
    topic: "Practical Networking Scenarios",
    subtopic: "IP Conflict",
    difficulty: "Moderate",
    question:
      "Two employee workstations in a branch office suddenly show 'IP Address Conflict' errors and lose network connectivity. What is the most likely cause and quickest fix?",
    options: [
      "The switch has failed completely and needs replacement",
      "Two devices have been assigned or manually configured with the same static IP address; releasing/renewing the DHCP lease or correcting the static IP resolves it",
      "The DNS server is down",
      "The firewall is blocking all traffic",
    ],
    correctAnswer: 1,
    explanation:
      "An 'IP Address Conflict' error specifically indicates two devices on the same network segment are using the identical IP address — often due to a manually (statically) configured address overlapping with the DHCP pool, or a DHCP scope misconfiguration. Releasing/renewing the DHCP lease, or correcting the duplicate static IP, resolves the conflict.",
    incorrectExplanations: {
      0: "A complete switch failure would cause total connectivity loss for all connected devices with generic errors, not a specific 'IP conflict' message pointing to duplicate addressing.",
      2: "A DNS server outage would cause name resolution failures, not an IP address conflict error, which is specifically about duplicate addressing.",
      3: "A firewall blocking traffic would typically cause connection timeouts/blocked access, not the specific 'IP conflict' symptom tied to duplicate IP assignment.",
    },
    estimatedTime: 35,
    memoryTrick: "'IP Conflict' error = ALWAYS means duplicate IP somewhere — check static assignments vs. DHCP pool overlap.",
    examTip: "Matching specific error messages to their root cause is a common practical troubleshooting question format.",
  },
  {
    id: "SCN-005",
    topic: "Practical Networking Scenarios",
    subtopic: "Slow Network Diagnosis",
    difficulty: "Hard",
    question:
      "Users at a branch report the network has become extremely slow. Using 'netstat', the administrator notices an unusually high number of established connections to an unfamiliar external IP address from a single workstation. What should the administrator suspect FIRST?",
    options: [
      "A faulty network cable at that workstation",
      "The workstation may be infected with malware (e.g., part of a botnet) generating excessive outbound traffic to a command-and-control server",
      "The DHCP server has run out of IP addresses",
      "The workstation's monitor resolution is set too high",
    ],
    correctAnswer: 1,
    explanation:
      "An unusually high number of established connections from one workstation to an unfamiliar external IP is a classic symptom of malware — potentially a botnet client repeatedly communicating with a command-and-control (C2) server — and should be investigated as a likely security incident, not a simple hardware issue.",
    incorrectExplanations: {
      0: "A faulty cable would typically cause intermittent connectivity or complete loss, not a pattern of many active outbound connections to a suspicious external address.",
      2: "A DHCP exhaustion issue would prevent new devices from obtaining IP addresses; it has no direct relationship to one workstation's suspicious outbound connection pattern.",
      3: "Monitor resolution has no relationship whatsoever to network traffic patterns or bandwidth consumption.",
    },
    estimatedTime: 50,
    memoryTrick: "Suspicious outbound connections to unknown IPs = think malware/botnet first, not hardware.",
    examTip: "This tests combined knowledge: netstat's purpose PLUS basic security incident recognition — a favorite integrative question style.",
  },
  {
    id: "SCN-006",
    topic: "Practical Networking Scenarios",
    subtopic: "VPN Troubleshooting",
    difficulty: "Hard",
    question:
      "A remote bank employee's VPN client connects successfully (shows 'Connected'), but the employee cannot access any internal banking applications. What should be checked NEXT, assuming the VPN tunnel itself is confirmed established?",
    options: [
      "Whether the correct routes are being pushed through the VPN tunnel, and whether internal DNS/firewall rules permit the traffic",
      "Whether the employee's home Wi-Fi password is correct",
      "Whether the employee's monitor is turned on",
      "Whether the bank's public website is accessible from the employee's browser",
    ],
    correctAnswer: 0,
    explanation:
      "Since the VPN tunnel itself is established, the issue lies beyond basic connectivity — likely in routing (are internal subnet routes being pushed to the client?), internal DNS resolution over the tunnel, or firewall rules that may be blocking the specific application traffic even though the tunnel is up.",
    incorrectExplanations: {
      1: "If the VPN already shows 'Connected', the underlying Wi-Fi connection is clearly already functional; re-checking the Wi-Fi password is not the next logical troubleshooting step.",
      2: "A powered-off monitor is unrelated to any network connectivity issue and irrelevant to this scenario.",
      3: "Checking public website access does not help diagnose internal application access issues over an already-established VPN tunnel — it tests general internet access, not internal routing.",
    },
    estimatedTime: 45,
    memoryTrick: "VPN 'connected' but no internal access = check ROUTES, DNS, and FIREWALL rules next — the tunnel isn't the whole picture.",
    examTip: "This models real IT helpdesk logic — practicing this step-by-step elimination approach helps with several scenario-style questions.",
  },
  {
    id: "SCN-007",
    topic: "Banking Network Concepts",
    subtopic: "Data Centre Design",
    difficulty: "Hard",
    question: "Why do banks typically maintain a geographically separate Disaster Recovery (DR) site with real-time or near-real-time data replication from the primary data centre?",
    options: [
      "To reduce the total number of servers needed",
      "To ensure business continuity and minimal data loss if the primary data centre experiences an outage, disaster, or catastrophic failure",
      "To provide free internet access to employees",
      "To eliminate the need for firewalls at the primary site",
    ],
    correctAnswer: 1,
    explanation:
      "A geographically separate DR site with data replication ensures that if the primary data centre fails (due to fire, natural disaster, power outage, or major technical failure), the bank can fail over operations to the DR site with minimal disruption and data loss, meeting regulatory and business continuity requirements.",
    incorrectExplanations: {
      0: "DR sites actually require additional servers/infrastructure to mirror the primary site, not fewer.",
      2: "DR site design is entirely unrelated to employee internet access provisioning.",
      3: "Firewalls remain essential at both the primary and DR sites; a DR site does not eliminate this security requirement.",
    },
    estimatedTime: 40,
    memoryTrick: "DR site = the bank's 'insurance policy' against catastrophic primary site failure.",
    examTip: "RTO (Recovery Time Objective) and RPO (Recovery Point Objective) are related DR concepts sometimes referenced — RTO=how fast you recover, RPO=how much data you can afford to lose.",
  },
  {
    id: "SCN-008",
    topic: "Practical Networking Scenarios",
    subtopic: "Bandwidth Calculation",
    difficulty: "Hard",
    question:
      "A branch has a 2 Mbps internet link. If a single CBS transaction requires approximately 20 Kbps of sustained bandwidth, what is the theoretical maximum number of simultaneous transactions the link can support (ignoring overhead)?",
    options: ["10", "50", "100", "200"],
    correctAnswer: 2,
    explanation:
      "2 Mbps = 2000 Kbps (using 1 Mbps = 1000 Kbps for simplicity). 2000 Kbps ÷ 20 Kbps per transaction = 100 simultaneous transactions theoretically supportable, ignoring protocol overhead and other traffic.",
    incorrectExplanations: {
      0: "10 significantly underestimates the link's capacity relative to the given per-transaction bandwidth requirement.",
      1: "50 would result from incorrectly using 1000 Kbps total (i.e., treating the link as 1 Mbps instead of 2 Mbps).",
      3: "200 would incorrectly double the actual available bandwidth relative to the stated 2 Mbps link.",
    },
    estimatedTime: 40,
    memoryTrick: "1 Mbps = 1000 Kbps — always convert units carefully before dividing in bandwidth math questions.",
    examTip: "Bandwidth capacity-planning math questions are common in the banking-specific numerical/scenario section — watch unit conversions closely (Mbps vs Kbps vs MBps).",
  },
  {
    id: "SCN-009",
    topic: "Banking Network Concepts",
    subtopic: "Regulatory Compliance",
    difficulty: "Moderate",
    question: "Which of the following best describes why banks are required to implement strict network segmentation between the cardholder data environment (CDE) and other parts of the network, per standards like PCI DSS?",
    options: [
      "To make the network diagram look more organized",
      "To reduce the scope of systems subject to strict compliance audits and limit the potential impact/spread of a security breach involving sensitive card data",
      "To make the network run faster",
      "To eliminate the need for any firewalls",
    ],
    correctAnswer: 1,
    explanation:
      "Network segmentation isolates systems that store, process, or transmit cardholder data (the CDE) from the rest of the network, which both limits the number of systems subject to full PCI DSS audit scope and contains the potential damage if a breach occurs elsewhere in the broader network.",
    incorrectExplanations: {
      0: "While segmentation can improve organization, this is not the compliance-driven rationale behind the requirement.",
      2: "Segmentation is a security/compliance measure, not primarily a performance optimization technique, though it can have incidental performance benefits.",
      3: "Segmentation typically relies on firewalls/ACLs to enforce the isolation between zones — it does not eliminate the need for them.",
    },
    estimatedTime: 35,
    memoryTrick: "Segmentation = smaller 'blast radius' if a breach happens, and smaller compliance audit scope.",
    examTip: "PCI DSS segmentation rationale (reduce scope + limit breach impact) is a two-part answer often tested together.",
  },
  {
    id: "SCN-010",
    topic: "Practical Networking Scenarios",
    subtopic: "Wireless Troubleshooting",
    difficulty: "Moderate",
    question:
      "Employees near the edge of a branch office report weak or dropped Wi-Fi signal, while those near the access point have no issues. What is the most appropriate first step to address this?",
    options: [
      "Replace all employee laptops with new hardware",
      "Assess signal coverage and consider adding another access point or adjusting placement/power settings to improve coverage in that area",
      "Switch the entire office to a wired-only network with no explanation to affected users",
      "Change the bank's core banking software version",
    ],
    correctAnswer: 1,
    explanation:
      "Weak signal specifically at the edges of coverage, while working fine near the AP, points to a coverage/range limitation — addressed by adding access points, adjusting AP placement, or tuning transmit power/channel settings to extend and balance coverage.",
    incorrectExplanations: {
      0: "Replacing laptops would not resolve a physical RF coverage limitation affecting all devices in that weak-signal area.",
      2: "Abruptly forcing wired-only access ignores the actual coverage problem and may not be practical or desired for all users' mobility needs.",
      3: "Core banking software version is entirely unrelated to physical Wi-Fi signal coverage issues.",
    },
    estimatedTime: 35,
    memoryTrick: "Signal weak only at edges = coverage/placement issue, not a device or software problem.",
    examTip: "Wireless site survey and AP placement concepts occasionally appear as follow-up detail in these coverage-related scenario questions.",
  },
  {
    id: "SCN-011",
    topic: "Practical Networking Scenarios",
    subtopic: "Subnetting Application",
    difficulty: "Hard",
    question:
      "A bank's IT team is allocating a new /24 network (203.0.113.0/24) to a branch with three departments requiring separate broadcast domains: Loans (60 hosts), Operations (30 hosts), and Admin (12 hosts). Using VLSM, what subnet mask should be used for the Loans department?",
    options: ["/25", "/26", "/27", "/24"],
    correctAnswer: 1,
    explanation:
      "For 60 hosts, we need 2^n - 2 >= 60, so n=6 (2^6-2=62), which requires 6 host bits, giving a mask of /26 (32-6=26) — this is the tightest efficient fit for 60 hosts.",
    incorrectExplanations: {
      0: "/25 provides 126 usable hosts, more than double what's needed for 60 hosts — an inefficient oversized allocation for VLSM purposes.",
      2: "/27 provides only 2^5-2=30 usable hosts, insufficient for the 60-host Loans department requirement.",
      3: "/24 (254 hosts) would use the entire original address block for just one department, wasting most of the address space needed for the other two departments.",
    },
    estimatedTime: 55,
    memoryTrick: "Always solve 2^n - 2 >= required hosts for the minimum n, then mask = 32 - n.",
    examTip: "This tests VLSM applied to a banking-specific department-based subnetting scenario — a very likely real exam question style.",
  },
  {
    id: "SCN-012",
    topic: "Practical Networking Scenarios",
    subtopic: "Firewall Rule Logic",
    difficulty: "Hard",
    question:
      "A firewall administrator needs to allow only HTTPS traffic (port 443) from the internet to a specific banking web server (203.0.113.10) while blocking all other inbound traffic to that server. Which approach correctly achieves this using firewall rules?",
    options: [
      "Create a single rule allowing all inbound traffic to 203.0.113.10",
      "Create a rule permitting inbound TCP port 443 to 203.0.113.10, followed by an implicit or explicit deny-all rule for any other inbound traffic to that host",
      "Block port 443 specifically and allow everything else",
      "Configure NAT only, without any firewall rules",
    ],
    correctAnswer: 1,
    explanation:
      "The correct approach is to explicitly permit only the required traffic (TCP port 443/HTTPS) to the specific server, relying on the firewall's default-deny posture (or an explicit deny-all rule) to block everything else — following the security best practice of 'default deny, explicitly allow only what's needed'.",
    incorrectExplanations: {
      0: "Allowing ALL inbound traffic defeats the purpose of restricting access to only HTTPS — this would expose the server to unnecessary risk.",
      2: "This does the exact opposite of the requirement — blocking the desired port (443) while allowing everything else is backwards and highly insecure.",
      3: "NAT alone does not provide traffic filtering/access control; a firewall rule set is specifically required to enforce this kind of port-based restriction.",
    },
    estimatedTime: 45,
    memoryTrick: "Security best practice: 'default deny, explicitly allow only what's necessary.'",
    examTip: "Firewall rule ordering and the 'default deny' principle is a foundational security concept tested in various phrasings.",
  },
  {
    id: "SCN-013",
    topic: "Banking Network Concepts",
    subtopic: "Network Monitoring",
    difficulty: "Moderate",
    question:
      "A bank's Network Operations Centre (NOC) uses a centralized monitoring system that receives real-time alerts (traps) whenever a critical router or switch goes down. Which protocol most likely enables this alerting capability?",
    options: ["FTP", "SNMP (using traps)", "Telnet", "HTTP"],
    correctAnswer: 1,
    explanation:
      "SNMP supports 'traps' — unsolicited notifications sent from a managed device (like a router or switch) to a monitoring/management station immediately when a significant event occurs (e.g., interface down), enabling real-time alerting without the management station needing to constantly poll.",
    incorrectExplanations: {
      0: "FTP is used for file transfers, entirely unrelated to device health monitoring or alerting.",
      2: "Telnet provides remote command-line access, not a monitoring/alerting mechanism.",
      3: "HTTP is a general web protocol; while some monitoring dashboards use HTTP/HTTPS for display, the underlying alerting mechanism described (traps) is specifically an SNMP feature.",
    },
    estimatedTime: 30,
    memoryTrick: "SNMP Traps = devices proactively 'shout' alerts to the monitoring station when something goes wrong.",
    examTip: "SNMP polling (management station asks devices) vs. SNMP traps (devices proactively notify) is a useful sub-distinction.",
  },
  {
    id: "SCN-014",
    topic: "Practical Networking Scenarios",
    subtopic: "MAC Flooding",
    difficulty: "Hard",
    question:
      "An attacker floods a switch with thousands of frames containing fake, random source MAC addresses, overflowing its MAC address table. What is the likely consequence, and what attack is this?",
    options: [
      "The switch will simply ignore the extra frames with no impact; this is called ARP poisoning",
      "The switch's MAC table overflows and it may begin flooding traffic to all ports like a hub, allowing the attacker to sniff traffic; this is called a MAC flooding attack",
      "The switch automatically shuts down all ports permanently; this is called a Smurf attack",
      "The switch converts to a router; this is called VLAN hopping",
    ],
    correctAnswer: 1,
    explanation:
      "A MAC flooding attack overwhelms a switch's finite CAM (MAC address) table with bogus entries. Once full, many switches fail open — flooding subsequent unknown-destination frames out to ALL ports (similar to a hub) rather than a single correct port, allowing an attacker to capture traffic that shouldn't normally reach their port.",
    incorrectExplanations: {
      0: "The switch does NOT simply ignore this without impact — the described attack fills the MAC table, causing flooding behavior; also, this describes MAC flooding, not ARP poisoning (a different attack targeting IP-to-MAC mappings).",
      2: "Permanent port shutdown is not the typical automatic consequence of MAC flooding, and this is not called a Smurf attack (which is an ICMP amplification attack).",
      3: "A switch does not become a router due to MAC flooding, and this is not VLAN hopping (a different Layer 2 attack exploiting trunk misconfigurations).",
    },
    estimatedTime: 50,
    memoryTrick: "MAC flooding = overflow the CAM table → switch 'fails open' → acts like a hub → attacker can sniff traffic.",
    examTip: "Port security (limiting MAC addresses learned per port) is the standard defense against MAC flooding — a commonly paired follow-up fact.",
  },
  {
    id: "SCN-015",
    topic: "Banking Network Concepts",
    subtopic: "Change Management",
    difficulty: "Moderate",
    question:
      "Before deploying a major configuration change to core banking network routers during business hours, what is the standard best practice a bank's IT team should follow?",
    options: [
      "Deploy the change immediately without testing, since delays cost money",
      "Test the change in a staging/lab environment, schedule it during an approved maintenance window with a documented rollback plan, and follow formal change management procedures",
      "Only inform the CEO after the change has already caused an outage",
      "Skip documentation since the team already knows what they're doing",
    ],
    correctAnswer: 1,
    explanation:
      "Standard IT change management best practice requires testing changes in a non-production environment, scheduling deployment during an approved maintenance window (often outside peak business hours), having a documented rollback plan in case of issues, and following formal approval procedures — minimizing risk to critical banking operations.",
    incorrectExplanations: {
      0: "Deploying untested changes directly to production, especially for core banking systems, risks major outages and violates standard change management discipline.",
      2: "Proper change management involves proactive approval and communication BEFORE changes are made, not reactive notification after an outage has already occurred.",
      3: "Documentation is a critical part of formal change management for audit, compliance, and troubleshooting purposes — skipping it is poor practice, especially in regulated banking environments.",
    },
    estimatedTime: 35,
    memoryTrick: "Change management = Test → Schedule (maintenance window) → Document rollback → Approve → Deploy.",
    examTip: "ITIL-style change management concepts occasionally surface in banking IT governance questions alongside pure networking topics.",
  },
];

export default scenarios;
