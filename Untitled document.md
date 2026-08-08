TVARIT: Architectural Blueprint and Technical Specification for Rural Healthcare TriageExecutive SummaryThe structural disparities inherent in rural healthcare logistics consistently generate critical delays during emergency patient triage and hospital referrals. In regions such as Sundahalli, Karnataka, Primary Health Centres (PHCs) and frontline workers are frequently forced to execute blind referrals due to the absence of unified, real-time telemetry bridging rural clinics and centralized government hospitals. This systemic disconnect often results in trauma patients arriving at facilities that may possess open beds but entirely lack compatible blood units, precipitating life-threatening delays. The PulseNet platform resolves this crisis through the deployment of a real-time, multi-role web application designed specifically to eliminate referral guesswork and establish instantaneous, data-driven patient handoffs.By synchronizing live geospatial data from the Ayushman Bharat Digital Mission (ABDM) Health Facility Registry with real-time blood bank inventories from the e-RaktKosh network, PulseNet ensures that frontline workers can instantly locate the nearest government facility equipped to handle specific trauma and hematological requirements. The platform employs a dual-authentication portal architecture, strictly separating the referral logic of the Customer/PHC interface from the receiving logic of the Doctor/Admin dashboard. Real-time state synchronization is governed by Supabase PostgreSQL logical replication broadcasted over WebSockets, while Next.js 15 handles optimized server-side rendering and edge middleware authentication. To accelerate user interface development without sacrificing design consistency, the Google Stitch Model Context Protocol (MCP) framework is utilized for programmatic design extraction and rapid React component generation. This document serves as an exhaustive technical specification, encompassing the overarching system architecture, secure database schemata, third-party API integration workflows, repository structures, and a streamlined execution roadmap optimized for AI-assisted development.Deliverable 1: System Architecture and Data Flow ParadigmThe architectural foundation of PulseNet operates on a highly decoupled, serverless infrastructure designed to withstand the intermittent connectivity typical of rural Indian topographies while simultaneously delivering zero-latency state updates to hospital administrators. The system is bifurcated into distinct operational zones, each tailored to the computational constraints and workflow realities of its respective user base.Core Architectural Layers and InfrastructureThe presentation layer utilizes the Next.js 15 App Router, delivering highly optimized React 19 Server Components alongside targeted Client Components for interactive elements like geospatial mapping. Given the rural context, offline resilience is not merely an enhancement but a fundamental operational requirement. Progressive Web Application (PWA) technologies, specifically Service Workers and the Background Sync API, are integrated to cache the application shell and manage network dropouts gracefully. When a frontline worker attempts to issue a referral in a dead zone, the mutation payload is serialized and written to an IndexedDB wrapper. The Service Worker continuously monitors network state listeners; upon reconnection, the queued referral is autonomously pushed to the backend, ensuring uninterrupted triage operations even in compromised environments.The persistence and real-time synchronization layer is powered by Supabase, utilizing a managed PostgreSQL instance. Supabase Auth handles identity verification, issuing JSON Web Tokens (JWTs) that are intercepted by edge middleware to route users to their respective portals. Supabase Realtime acts as the central nervous system of the Doctor Dashboard, utilizing PostgreSQL's logical replication to listen for specific row-level mutations (such as a new referral insertion) and broadcasting these events over WebSockets. This allows the receiving hospital to hear an audible alert and view a visual badge the exact millisecond a PHC worker dispatches an ambulance.The external integration layer is the data engine of the platform, interfacing with two primary government systems and one rendering engine. The Ayushman Bharat Digital Mission (ABDM) Health Facility Registry (HFR) API is queried to supply geospatial coordinates, facility identification tokens, and infrastructural capacity metrics for all regional public hospitals. Simultaneously, the platform interfaces with the e-RaktKosh API to determine real-time regional blood bank inventories, cross-referencing available stock with the facility locations. Finally, Mapbox GL JS is utilized on the client side to render high-performance vector maps, dynamically plotting the integrated data to visualize proximity and status.Architecture LayerCore TechnologyPrimary FunctionResiliency MechanismPresentationNext.js 15 (App Router), React 19Renders UI, manages client state, routes user portals.PWA Service Worker caching, offline shell rendering.Local PersistenceIndexedDBStores optimistic UI updates and caches offline requests.Background Sync API for deferred backend execution.Database & AuthSupabase (PostgreSQL), JWTsStores relational data, handles RBAC and user identities.Database-level row locking, edge middleware validation.Real-Time SyncSupabase Realtime (WebSockets)Pushes instant referral alerts to hospital dashboards.Automatic reconnection backoff algorithms.External APIsABDM HFR, e-RaktKosh, Mapbox GL JSFetches live hospital coordinates and blood inventory.Server-side caching, geo-spatial filtering algorithms.System Data Flow and Execution SequenceThe operational lifecycle of a single referral traverses multiple boundaries, transforming raw geographical and medical inputs into a securely locked hospital reservation. The sequence below illustrates the chronological execution of the dual-criteria matching and reservation engine.Code snippetsequenceDiagram  
    autonumber  
    actor PHC as PHC Worker (Referrer)  
    participant Client as Next.js 15 Client  
    participant IDB as IndexedDB (Offline Queue)  
    participant API as Next.js API Routes (Server)  
    participant Gov APIs as ABDM HFR / e-RaktKosh  
    participant Supabase as Supabase (PostgreSQL)  
    participant WebSocket as Supabase Realtime  
    actor Doctor as Hospital Admin (Receiver)

    Note over PHC, Client: Patient Triage & Geospatial Discovery Phase  
    PHC-\>\>Client: Initializes PulseNet App (Geolocation Active)  
    Client-\>\>API: Request Nearby Facilities (lat, lng)  
    API-\>\>Gov APIs: Fetch Facilities (ABDM) & Blood (e-RaktKosh)  
    Gov APIs--\>\>API: Return Aggregated Facility Data  
    API--\>\>Client: Render Mapbox GL JS with Status Markers  
      
    Note over PHC, Supabase: Referral Request & Offline Fallback Phase  
    PHC-\>\>Client: Submit Triage Form (e.g., Trauma, O- Blood)  
    alt Network Unavailable  
        Client-\>\>IDB: Serialize and queue referral request  
        IDB--\>\>Client: Display "Pending Sync" Indicator  
    else Network Available  
        Client-\>\>API: POST /api/referral  
        API-\>\>Supabase: INSERT INTO referrals  
        Supabase--\>\>API: Referral Token Generated (PENDING)  
        API--\>\>Client: Display QR-Enabled Referral Token  
    end  
      
    Note over Supabase, Doctor: Real-Time Telemetry & Acceptance Phase  
    Supabase-\>\>WebSocket: Broadcast INSERT event to 'referrals' channel  
    WebSocket--\>\>Doctor: Trigger UI Alert (Audio/Visual Badge)  
    Doctor-\>\>Supabase: UPDATE referral\_status \= 'ACCEPTED'  
    Supabase-\>\>Supabase: DB Trigger: FOR UPDATE Lock & Decrement Blood  
    Supabase-\>\>WebSocket: Broadcast UPDATE event to 'referrals' channel  
    WebSocket--\>\>PHC: Status changes to ACCEPTED (Green Confirmation)  
This data flow ensures that the PHC worker is never left waiting for a page reload. The dual-criteria hospital matching algorithm executes on the server side, combining the facility location data from the ABDM registry with the blood unit arrays from e-RaktKosh. The Mapbox GL JS instance then receives a highly optimized GeoJSON payload, rendering markers that are color-coded based on the exact availability of both beds and the requested blood type.Deliverable 2: Supabase Database Schema and Concurrency ManagementDesigning the database schema for an emergency medical referral engine requires strict adherence to data integrity principles, particularly regarding concurrent transactions. A critical vulnerability in distributed inventory systems—such as booking hospital beds or claiming blood units—is the "lost update" anomaly. This race condition occurs when two distinct transactions read a row simultaneously, compute a new value based on that stale read, and write it back, silently overwriting the concurrent commit and resulting in negative inventory balances.While upgrading the PostgreSQL transaction isolation level to SERIALIZABLE can theoretically prevent this, it frequently introduces serialization failure errors (SQLSTATE 40001\) that force the application layer to implement complex retry loops, masking rather than preventing the underlying race during the original operational window. To engineer a more robust and deterministic solution, the PulseNet architecture utilizes explicit row-level locking via the SELECT ... FOR UPDATE clause within a database trigger. This mechanism acquires an exclusive lock on the specific blood inventory row, forcing any concurrent acceptance requests to wait until the first transaction commits, thereby completely neutralizing the lost update anomaly without requiring application-side retry logic.Furthermore, relying on the default auth.role() function for application-level Role-Based Access Control (RBAC) represents a pervasive security anti-pattern in Supabase deployments. The auth.role() function merely returns the PostgreSQL connection role (e.g., authenticated or anon), providing no granular insight into whether the user is a PHC worker or a Hospital Administrator. Instead, the architecture deploys a custom authentication hook that intercepts the JWT generation process at sign-in, querying the profiles table and injecting a custom user\_role claim directly into the token payload. This allows the Row Level Security (RLS) policies to evaluate permissions synchronously via auth.jwt()-\>\>'user\_role', entirely bypassing the latency of recursive table joins during subsequent queries.Executable PostgreSQL SQL Migration ScriptThe following SQL migration script constructs the foundational enumerations, tables, custom JWT hooks, security policies, and concurrency-safe triggers required for the production deployment of the PulseNet database.SQL-- \==========================================  
\-- 1\. ENUMERATED TYPES  
\-- \==========================================  
\-- Defines the core categorical constraints for application logic.  
CREATE TYPE public.user\_role AS ENUM ('CUSTOMER\_PHC', 'DOCTOR\_ADMIN');  
CREATE TYPE public.triage\_level AS ENUM ('RED', 'YELLOW', 'GREEN');  
CREATE TYPE public.referral\_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'TRANSFERRED');

\-- \==========================================  
\-- 2\. TABLES & INDEXES  
\-- \==========================================

\-- Profiles Table: Extends the native auth.users table to store domain-specific metadata.  
CREATE TABLE public.profiles (  
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
    email TEXT UNIQUE NOT NULL,  
    full\_name TEXT NOT NULL,  
    role public.user\_role NOT NULL DEFAULT 'CUSTOMER\_PHC',  
    facility\_id TEXT, \-- Remains null for PHC workers, strictly populated for DOCTOR\_ADMIN  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
CREATE INDEX idx\_profiles\_role ON public.profiles(role);

\-- Facilities Table: A local cache mirroring the ABDM Health Facility Registry data.  
CREATE TABLE public.facilities (  
    hfr\_id TEXT PRIMARY KEY, \-- The official Ayushman Bharat Registry ID  
    name TEXT NOT NULL,  
    latitude DOUBLE PRECISION NOT NULL,  
    longitude DOUBLE PRECISION NOT NULL,  
    total\_beds INT NOT NULL DEFAULT 0,  
    available\_beds INT NOT NULL DEFAULT 0,  
    last\_synced TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
CREATE INDEX idx\_facilities\_location ON public.facilities(latitude, longitude);

\-- Blood Inventory Table: A localized ledger mirroring e-RaktKosh availability.  
CREATE TABLE public.blood\_inventory (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    facility\_hfr\_id TEXT REFERENCES public.facilities(hfr\_id) ON DELETE CASCADE,  
    blood\_type TEXT NOT NULL CHECK (blood\_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),  
    available\_units INT NOT NULL DEFAULT 0 CHECK (available\_units \>= 0),  
    last\_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
    UNIQUE(facility\_hfr\_id, blood\_type)  
);

\-- Referrals Table: The central operational ledger linking patients to facilities.  
CREATE TABLE public.referrals (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    patient\_name TEXT NOT NULL,  
    referrer\_id UUID REFERENCES public.profiles(id) NOT NULL,  
    target\_facility\_id TEXT REFERENCES public.facilities(hfr\_id) NOT NULL,  
    triage\_status public.triage\_level NOT NULL,  
    symptoms TEXT,  
    requested\_blood\_type TEXT,  
    requested\_blood\_units INT DEFAULT 0,  
    status public.referral\_status NOT NULL DEFAULT 'PENDING',  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
\-- Optimized index for the Doctor Dashboard real-time feed  
CREATE INDEX idx\_referrals\_target\_status ON public.referrals(target\_facility\_id, status);

\-- \==========================================  
\-- 3\. CUSTOM JWT AUTHENTICATION HOOK  
\-- \==========================================  
\-- Intercepts the Supabase token issuance to inject the 'user\_role' claim.  
\-- This ensures RLS policies execute in O(1) time without recursive table joins.  
CREATE OR REPLACE FUNCTION public.custom\_access\_token\_hook(event jsonb)  
RETURNS jsonb  
LANGUAGE plpgsql STABLE  
AS $$  
DECLARE  
    claims jsonb;  
    app\_role public.user\_role;  
BEGIN  
    \-- Extract the application role based on the triggering user UUID  
    SELECT role INTO app\_role FROM public.profiles WHERE id \= (event-\>\>'user\_id')::uuid;  
    claims := event-\>'claims';  
      
    \-- Inject the retrieved role into the custom claims dictionary  
    IF app\_role IS NOT NULL THEN  
        claims := jsonb\_set(claims, '{user\_role}', to\_jsonb(app\_role));  
    ELSE  
        \-- Fallback to least-privileged access model  
        claims := jsonb\_set(claims, '{user\_role}', '"CUSTOMER\_PHC"');  
    END IF;  
      
    \-- Update and return the modified event payload  
    event := jsonb\_set(event, '{claims}', claims);  
    RETURN event;  
END;  
$$;

\-- Grant execution privileges exclusively to the internal Supabase auth service  
GRANT EXECUTE ON FUNCTION public.custom\_access\_token\_hook TO supabase\_auth\_admin;  
REVOKE EXECUTE ON FUNCTION public.custom\_access\_token\_hook FROM authenticated, anon, public;

\-- \==========================================  
\-- 4\. ROW LEVEL SECURITY (RLS) POLICIES  
\-- \==========================================  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.blood\_inventory ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

\-- Public reference tables require unrestricted read access for the map component  
CREATE POLICY "Public read access for facilities"   
ON public.facilities FOR SELECT USING (true);

CREATE POLICY "Public read access for blood inventory"   
ON public.blood\_inventory FOR SELECT USING (true);

\-- PHC Workers (Referrers) Data Silo Policies  
CREATE POLICY "PHC workers can view their own referrals"   
ON public.referrals FOR SELECT   
USING (auth.uid() \= referrer\_id AND (auth.jwt()-\>\>'user\_role') \= 'CUSTOMER\_PHC');

CREATE POLICY "PHC workers can insert referrals"   
ON public.referrals FOR INSERT   
WITH CHECK (auth.uid() \= referrer\_id AND (auth.jwt()-\>\>'user\_role') \= 'CUSTOMER\_PHC');

\-- Hospital Administrators (Receivers) Data Silo Policies  
CREATE POLICY "Doctors can view inbound facility referrals"   
ON public.referrals FOR SELECT   
USING (  
    (auth.jwt()-\>\>'user\_role') \= 'DOCTOR\_ADMIN'   
    AND target\_facility\_id \= (SELECT facility\_id FROM public.profiles WHERE id \= auth.uid())  
);

CREATE POLICY "Doctors can update inbound facility referrals"   
ON public.referrals FOR UPDATE   
USING (  
    (auth.jwt()-\>\>'user\_role') \= 'DOCTOR\_ADMIN'   
    AND target\_facility\_id \= (SELECT facility\_id FROM public.profiles WHERE id \= auth.uid())  
);

\-- \==========================================  
\-- 5\. CONCURRENCY-SAFE TRANSACTION TRIGGER  
\-- \==========================================  
\-- This function executes automatically before a referral update is committed.  
\-- It locks the target blood inventory row to prevent race conditions during acceptance.  
CREATE OR REPLACE FUNCTION public.decrement\_blood\_on\_acceptance()  
RETURNS TRIGGER AS $$  
DECLARE  
    current\_blood INT;  
BEGIN  
    \-- Verify the state mutation is specifically an administrative acceptance  
    IF NEW.status \= 'ACCEPTED' AND OLD.status \= 'PENDING' THEN  
          
        \-- Check if hematological resources were explicitly requested  
        IF NEW.requested\_blood\_type IS NOT NULL AND NEW.requested\_blood\_units \> 0 THEN  
              
            \-- Acquire an exclusive row-level lock (FOR UPDATE)  
            \-- This suspends concurrent transactions attempting to read this specific row  
            \-- until the current transaction commits, neutralizing the Lost Update anomaly.  
            SELECT available\_units INTO current\_blood  
            FROM public.blood\_inventory  
            WHERE facility\_hfr\_id \= NEW.target\_facility\_id   
              AND blood\_type \= NEW.requested\_blood\_type  
            FOR UPDATE;

            \-- Validate constraints prior to mathematical decrementation  
            IF current\_blood \< NEW.requested\_blood\_units THEN  
                RAISE EXCEPTION 'Insufficient blood units available. Required: %, Available: %',   
                                NEW.requested\_blood\_units, current\_blood;  
            END IF;

            \-- Execute the decrement operation safely  
            UPDATE public.blood\_inventory  
            SET available\_units \= available\_units \- NEW.requested\_blood\_units,  
                last\_updated \= NOW()  
            WHERE facility\_hfr\_id \= NEW.target\_facility\_id   
              AND blood\_type \= NEW.requested\_blood\_type;  
        END IF;

        \-- Safely decrement available beds assuming a 1:1 patient-to-bed ratio  
        UPDATE public.facilities  
        SET available\_beds \= available\_beds \- 1,  
            last\_synced \= NOW()  
        WHERE hfr\_id \= NEW.target\_facility\_id;  
          
    END IF;  
    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

\-- Bind the concurrency function to the referrals table  
CREATE TRIGGER trigger\_referral\_acceptance  
BEFORE UPDATE ON public.referrals  
FOR EACH ROW  
EXECUTE FUNCTION public.decrement\_blood\_on\_acceptance();  
Security ContextPolicy FocusEnforcement MechanismConcurrency StrategyReferral InsertionRestrict to Frontline Workersauth.jwt()-\>\>'user\_role' \= 'CUSTOMER\_PHC'Optimistic insertion via Next.js server actions.Referral AcceptanceRestrict to Hospital Adminsauth.jwt()-\>\>'user\_role' \= 'DOCTOR\_ADMIN'Pessimistic FOR UPDATE lock on inventory rows.Inventory MutabilityPrevent negative stock levelsRLS Update Policy \+ Database Check ConstraintsException raising on insufficient unit validation.Deliverable 3: Stitch MCP and Third-Party API Integration StrategyThe realization of the PulseNet platform depends heavily on synthesizing disparate data streams into a coherent, highly responsive user interface. This is achieved by combining Google's AI-driven design generation with stringent government API protocols and advanced geospatial rendering techniques.3.1 Google Stitch MCP Workflow and Design DNA ExtractionGoogle's Stitch platform, powered by Gemini 2.5 Pro, facilitates the generation of production-ready HTML and CSS layouts directly from text prompts. However, integrating these AI-generated designs into a local Next.js environment necessitates a reliable bridge, provided by the davideast/stitch-mcp Command Line Interface (CLI) framework. The Model Context Protocol (MCP) server allows AI coding agents (such as Cursor or Claude Code) to invoke specific Stitch commands as virtual tools.To initialize this workflow, developers must configure Google Cloud authentication, ensuring that the isolated gcloud SDK does not conflict with existing global installations, a common cause of OAuth proxy failures. The environment is configured using the initialization command:Bashnpx @\_davideast/stitch-mcp init  
A significant challenge when generating dual-portal interfaces (the PHC mobile view and the Doctor desktop dashboard) is maintaining cohesive design language across independent AI generations. Stitch lacks intrinsic cross-session memory. To solve this, the architecture dictates the use of the extract\_design\_context MCP tool. This tool parses the Document Object Model (DOM) of a master reference screen to extract its core "Design DNA," which includes typography, layout patterns, and explicit color tokens.The AI coding agent is instructed to invoke this tool against the master project ID, capturing the critical medical triage palette: Triage Red (\#EF4444), Triage Yellow (\#F59E0B), Triage Green (\#10B981), and Medical Blue (\#0284C7). These extracted variables are then systematically injected into the global Tailwind CSS configuration file, ensuring that subsequent generations of the Smart Triage Form and the Realtime Emergency Feed strictly adhere to the established visual hierarchy. The generated interfaces are then previewed locally using the development server command npx @\_davideast/stitch-mcp serve \-p \<PROJECT\_ID\>.3.2 ABDM Health Facility Registry (HFR) IntegrationThe integration with the Ayushman Bharat Digital Mission (ABDM) infrastructure requires navigating the strict cryptographic and header protocols of the V3 Gateway APIs. A fundamental architectural shift introduced in the ABDM V3 framework is the transition from an asynchronous callback-based discovery model to a synchronous execution model. The PulseNet backend must now execute spatial queries and construct the facility response directly within the HTTP request lifecycle, adhering to strict timeouts.Authentication against the sandbox environment (https://dev.abdm.gov.in/api/hiecm/gateway/v3/) mandates the generation of specific session tokens. Every API request must include a meticulously formatted header payload. The REQUEST-ID must be a standard 36-character UUID. The TIMESTAMP must be formatted strictly in ISO 8601 zero UTC format (e.g., YYYY-MM-DD'T'HH:MM.SS.SSS'Z'). The routing suffix X-CM-ID is explicitly validated as sbx for the sandbox testing phase and abdm upon production deployment. Furthermore, sensitive milestone data exchanges require Elliptic-curve Diffie–Hellman (ECDH) or RSA/ECB encryption protocols using public keys retrieved from the ABDM certificate endpoints.The implementation logic for retrieving government hospitals via the facility search endpoint demonstrates this stringent header construction:TypeScript// /lib/api/abdm.ts  
import crypto from 'crypto';

export async function fetchNearbyGovernmentHospitals(latitude: number, longitude: number) {  
  const requestId \= crypto.randomUUID();  
  const timestamp \= new Date().toISOString(); 

  const response \= await fetch('https://dev.abdm.gov.in/api/hiecm/gateway/v3/facility/search', {  
    method: 'POST',  
    headers: {  
      'Content-Type': 'application/json',  
      'REQUEST-ID': requestId,  
      'TIMESTAMP': timestamp,  
      'X-CM-ID': 'sbx', // Sandbox routing suffix  
      'Authorization': \`Bearer ${process.env.ABDM\_ACCESS\_TOKEN}\`  
    },  
    body: JSON.stringify({ latitude, longitude, radius: 50 })  
  });  
    
  if (\!response.ok) {  
    throw new Error(\`ABDM Gateway Error: ${response.statusText}\`);  
  }  
    
  return response.json();  
}  
3.3 e-RaktKosh API and Dual-Criteria FilteringThe e-RaktKosh platform, operated by the Ministry of Health and Family Welfare, functions as the centralized repository for national blood bank analytics. The PulseNet backend utilizes server-side polling to ingest the e-RaktKosh inventory data. When a PHC worker submits a location, the system orchestrates a dual-criteria matching algorithm. First, it extracts the raw geographical hospital data from the ABDM response. Second, it cross-references the facility identifiers against the e-RaktKosh dataset to append the available hematological units to each hospital object.This process yields a unified JSON array where each facility contains both its bed capacity and its real-time blood stock. The filtering logic subsequently masks any facility that fails to meet both the bed requirement and the specific blood type requirement (e.g., three units of O-), drastically narrowing the viable referral options to only those fully equipped for the incoming trauma.3.4 Mapbox GL JS Integration ArchitectureVisualizing the aggregated facility data requires the integration of Mapbox GL JS (or its open-source equivalent, MapLibre GL JS). Integrating Mapbox into the Next.js 15 App Router paradigm presents distinct challenges, as the framework heavily defaults to Server Components, whereas Mapbox relies entirely on client-side Window and Document objects.To resolve this, the map instantiation must be strictly encapsulated within a 'use client' boundary. Furthermore, the React 19 lifecycle demands rigorous management of mutable references via the useRef hook. If the Mapbox instance is not properly destroyed during unmounting, hot-reloading will spawn overlapping WebGL contexts, resulting in severe memory leaks and rendering instability. The implementation utilizes the useEffect cleanup return statement to invoke the map.current.remove() method, ensuring volatile memory is safely reclaimed. Markers are generated dynamically based on the dual-criteria algorithm, utilizing the extracted Stitch MCP color tokens to visually differentiate fully equipped facilities from those lacking resources.External SystemIntegration ProtocolData ResponsibilityImplementation ChallengeGoogle Stitch MCPdavideast/stitch-mcp CLIRapid React component generation from AI design DNA.Maintaining cross-screen layout consistency.ABDM HFR APIV3 Gateway REST APISynchronous facility location and capacity data.Strict header formatting and RSA cryptography.e-RaktKosh APIPolled REST IntegrationReal-time hematological inventory tracking.Latency reduction during geospatial cross-referencing.Mapbox GL JSWebGL Client RenderingDynamic map visualization of triage destinations.Preventing WebGL context leaks in React 19.Deliverable 4: Project Structure and File TreeThe architectural layout of the Next.js 15 monorepo is meticulously structured to enforce the separation of client-side interactivity, server-side data fetching, and edge-based authentication. Next.js 15 fundamentally alters how cookies and request headers are accessed on the server. Functions such as cookies() are no longer synchronous accessors; they return promises that must be explicitly awaited before their internal methods can be executed. Failing to resolve these promises within the Supabase Server Client initialization leads to catastrophic hydration errors and silent authentication failures across the application lifecycle.The directory tree reflects this updated @supabase/ssr architecture, utilizing nested route groups (indicated by parenthesis such as (auth)) to organize disparate layouts without affecting the URL path structure.pulsenet/  
├── app/  
│   ├── (auth)/  
│   │   ├── login/page.tsx             \# Universal entry point with Role-based redirection logic  
│   │   └── actions.ts                 \# Server actions handling signInWithPassword execution  
│   ├── (customer)/  
│   │   └── portal/  
│   │       ├── page.tsx               \# Client-rendered geospatial map & triage initialization  
│   │       └── layout.tsx             \# RLS Guard: Intercepts and redirects non-CUSTOMER\_PHC roles  
│   ├── (doctor)/  
│   │   └── dashboard/  
│   │       ├── page.tsx               \# Server-rendered initialization of the WebSocket feed  
│   │       └── layout.tsx             \# RLS Guard: Intercepts and redirects non-DOCTOR\_ADMIN roles  
│   ├── api/  
│   │   ├── abdm/route.ts              \# Proxy Route Handler managing ABDM cryptographic headers  
│   │   └── eraktkosh/route.ts         \# Proxy Route Handler orchestrating blood inventory polling  
│   ├── layout.tsx                     \# Global providers (React Query, Zustand state management)  
│   └── globals.css                    \# Tailwind CSS definitions, including Stitch MCP design tokens  
├── components/  
│   ├── map/  
│   │   └── FacilityMap.tsx            \# WebGL Mapbox implementation within a 'use client' boundary  
│   ├── triage/  
│   │   ├── TriageWizard.tsx           \# Multi-step state machine for symptom categorization  
│   │   └── BloodToggle.tsx            \# UI interface for specifying exact hematological requirements  
│   └── ui/  
│       └── Badge.tsx                  \# Framer Motion enhanced realtime status indicator  
├── lib/  
│   ├── supabase/  
│   │   ├── client.ts                  \# Browser Client instantiation (createBrowserClient)  
│   │   ├── server.ts                  \# Server Client instantiation (createServerClient)  
│   │   └── middleware.ts              \# Execution logic for updateSession routing  
│   └── types/  
│       └── database.types.ts          \# TypeScript interfaces mapping the PostgreSQL enumerations  
├── middleware.ts                      \# Next.js Edge Middleware invoking lib/supabase/middleware  
├── tailwind.config.ts                 \# Framework styling configuration  
└── tsconfig.json                      \# Strict TypeScript compiler configurationNext.js 15 Server Client ImplementationThe implementation of the server client demonstrates the mandatory asynchronous resolution of the cookies() function, a critical adaptation required for compatibility with the Next.js 15 App Router framework.TypeScript// /lib/supabase/server.ts  
import { createServerClient } from '@supabase/ssr'  
import { cookies } from 'next/headers'

export async function createClient() {  
  // CRITICAL: Next.js 15 requires awaiting the cookies function  
  const cookieStore \= await cookies(); 

  return createServerClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
    {  
      cookies: {  
        getAll() {  
          return cookieStore.getAll();  
        },  
        setAll(cookiesToSet) {  
          try {  
            cookiesToSet.forEach(({ name, value, options }) \=\> {  
              cookieStore.set(name, value, options);  
            });  
          } catch {  
            // Context executed from a React Server Component.   
            // Attempting to set cookies here will throw an error,  
            // which is safely caught and managed by middleware.ts.  
          }  
        },  
      },  
    }  
  );  
}  
Deliverable 5: 24-Hour Hackathon Execution RoadmapTo successfully deploy the PulseNet prototype within a highly constrained 24-hour timeframe, the development methodology must shift from traditional linear programming to "vibe coding"—a paradigm prioritizing aggressive AI-agent prompting paired with meticulously ordered human architectural oversight. By sequencing the workload to eliminate dependency gridlock, a solitary developer or small team can orchestrate the AI to generate vast amounts of boilerplate while human effort is reserved strictly for complex state management and cryptographic API debugging.Phase 1: Environment Provisioning and Database Schema (Hours 1-4)The initial phase establishes the foundational infrastructure. A failure at the schema level will cascade through the entire application, making early rigidity paramount.Initialize the monorepo using npx create-next-app@latest pulsenet, ensuring the App Router, TypeScript, and Tailwind CSS are selected.Provision the Supabase project and execute the provided SQL migration script directly within the Supabase SQL Editor.Deploy the custom authentication hook (custom\_access\_token\_hook) to inject the user\_role claims. Verify the execution by manually registering two distinct users via the Supabase dashboard and decoding their JWTs to confirm the presence of the role claim.AI Prompt Strategy: Instruct the agent to analyze the PostgreSQL schema and generate the exact matching TypeScript definitions: "Generate exhaustive TypeScript interfaces for the provided PostgreSQL schema, including all ENUMs, and place them in lib/types/database.types.ts."Phase 2: Design DNA Extraction and Core UI Generation (Hours 5-10)This phase leverages the Google Stitch MCP framework to rapidly synthesize the visual architecture, saving hours of manual CSS writing.Authenticate the local environment against Google Cloud using npx @\_davideast/stitch-mcp init.Utilize the AI agent to invoke the extract\_design\_context MCP tool against a predefined Stitch wireframe project. Extract the exact hex codes for the Triage Red, Yellow, Green, and Medical Blue, mapping them into the tailwind.config.ts file.Instruct the AI to generate the Triage Wizard and the Doctor Dashboard Action Cards via the get\_screen\_code command, wrapping them in functional React components.AI Prompt Strategy: "Using the extract\_design\_context MCP tool, generate a set of modular React UI components for the Triage Form. Apply Framer Motion for subtle micro-interactions specifically when the priority triage token renders."Phase 3: Edge Middleware and Route Protection (Hours 11-14)With the UI components generated, the application requires secure routing logic to segregate the dual-portal architecture.Implement the updateSession() logic within lib/supabase/middleware.ts, utilizing the @supabase/ssr package.Configure the root middleware.ts file to inspect incoming request paths. Extract and decode the JWT payload at the edge; if a user possessing the CUSTOMER\_PHC role attempts to navigate to the /dashboard route, issue an immediate 307 redirect back to the /portal.Thoroughly test cross-contamination vectors to ensure strict Role-Based Access Control enforcement.Phase 4: Government API Aggregation and Spatial Rendering (Hours 15-18)This phase connects the backend to the live national healthcare infrastructure, transforming the UI from a static mockup into a dynamic data engine.Construct the /api/abdm/route.ts API route handler. Ensure the cryptographic headers (REQUEST-ID, TIMESTAMP, X-CM-ID: sbx) are precisely formatted according to the sandbox documentation.Construct the proxy endpoint for the e-RaktKosh polling mechanism, executing the dual-criteria algorithm to merge the datasets based on facility identifiers.Implement the FacilityMap.tsx component using Mapbox GL JS, strictly managing the useRef lifecycle cleanup to prevent WebGL context exhaustion upon hot reloads.AI Prompt Strategy: "Write a Next.js 15 Route Handler that merges a mock JSON response from the e-RaktKosh API with a geospatial array of hospitals fetched from the ABDM Sandbox. Ensure the handler implements standard server-side caching for 60 seconds to prevent rate-limiting from the government endpoints."Phase 5: WebSocket Telemetry and Concurrency Testing (Hours 19-22)The core value proposition of PulseNet is the elimination of latency during triage handoffs. This phase wires the real-time telemetry.Within the Doctor Dashboard client component, initialize the Supabase Realtime channel. Subscribe exclusively to INSERT and UPDATE events on the referrals table, dynamically updating the React state array without requiring a page refresh.Implement the \[Accept Patient & Lock Blood Units\] button, binding it to a server action that issues an UPDATE command to the database.Conduct aggressive concurrency stress testing. Simulate two simultaneous administrators clicking "Accept" on differing referrals that request the final remaining unit of O- blood. Verify that the PostgreSQL FOR UPDATE trigger correctly acquires the row lock, allowing one transaction to succeed while safely raising a capacity exception for the other.Phase 6: Offline Resilience and Demonstration Polish (Hours 23-24)The final hours are dedicated to solidifying the application against the harsh realities of rural network infrastructure.Implement the IndexedDB fallback mechanism. If a referral is submitted while the navigator.onLine property is false, serialize the payload and store it in the browser's persistent storage, displaying a "Pending Sync" UI badge.Seed the Supabase database with diverse, highly visible demonstration data, including geographically scattered hospitals and a backlog of simulated emergency referrals.Rehearse the critical operational path multiple times: Form Initialization \-\> Spatial Map Selection \-\> Offline Serialization \-\> Reconnection Sync \-\> Real-Time Dashboard Alert \-\> Concurrency-Safe Blood Decrement.By meticulously adhering to this architectural blueprint, deploying the designated asynchronous Next.js 15 patterns, and enforcing strict concurrency safeguards at the database level, the PulseNet platform will effectively eradicate triage delays, modernize rural referral networks, and demonstrably reduce emergency mortality rates across targeted geographies.  
