ENGINEERING_EXPERIENCES = [

    # ==========================================================
    # CONNECTION RESET PATTERN
    # ==========================================================

    {
        "incident_id": "INC-101",
        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.1"
        },
        "failed_attempts": [
            {"action": "Increase connection pool"},
            {"action": "Modify retry configuration"}
        ],
        "successful_attempts": [
            {"action": "Revert connection lifecycle change"}
        ],
        "root_cause": "Connection lifecycle bug",
        "resolution": "Rollback deployment",
        "lessons": [
            "Connection pool tuning did not solve lifecycle bugs."
        ]
    },

    {
        "incident_id": "INC-102",
        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.2"
        },
        "failed_attempts": [
            {"action": "Increase connection pool"}
        ],
        "successful_attempts": [
            {"action": "Rollback recent deployment"}
        ],
        "root_cause": "Connection management regression",
        "resolution": "Rollback",
        "lessons": [
            "Recent deployments should be checked before scaling."
        ]
    },

    {
        "incident_id": "INC-103",
        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.3"
        },
        "failed_attempts": [
            {"action": "Increase pool size"}
        ],
        "successful_attempts": [
            {"action": "Revert connection handler"}
        ],
        "root_cause": "Socket lifecycle issue",
        "resolution": "Handler rollback",
        "lessons": [
            "Pool increases repeatedly failed."
        ]
    },

    # ==========================================================
    # DATABASE TIMEOUT PATTERN
    # ==========================================================

    {
        "incident_id": "INC-104",
        "problem": {
            "service": "Payment Service",
            "error": "DatabaseTimeout",
            "environment": "Production",
            "version": "4.1.0"
        },
        "failed_attempts": [
            {"action": "Increase application replicas"}
        ],
        "successful_attempts": [
            {"action": "Create missing database index"}
        ],
        "root_cause": "Full table scan",
        "resolution": "Add index",
        "lessons": [
            "Scaling application pods cannot fix slow queries."
        ]
    },

    {
        "incident_id": "INC-105",
        "problem": {
            "service": "Payment Service",
            "error": "DatabaseTimeout",
            "environment": "Production",
            "version": "4.1.1"
        },
        "failed_attempts": [
            {"action": "Increase database timeout"}
        ],
        "successful_attempts": [
            {"action": "Optimize query"}
        ],
        "root_cause": "Inefficient query plan",
        "resolution": "Query optimization",
        "lessons": [
            "Longer timeouts only hide symptoms."
        ]
    },

    {
        "incident_id": "INC-106",
        "problem": {
            "service": "Billing Service",
            "error": "DatabaseTimeout",
            "environment": "Production",
            "version": "3.0.5"
        },
        "failed_attempts": [
            {"action": "Increase worker count"}
        ],
        "successful_attempts": [
            {"action": "Add composite index"}
        ],
        "root_cause": "Missing index",
        "resolution": "Index creation",
        "lessons": [
            "Database bottlenecks require data-layer fixes."
        ]
    },

    # ==========================================================
    # REDIS TIMEOUT
    # ==========================================================

    {
        "incident_id": "INC-107",
        "problem": {
            "service": "Inventory Service",
            "error": "RedisTimeout",
            "environment": "Production",
            "version": "3.5.0"
        },
        "failed_attempts": [
            {"action": "Increase API timeout"}
        ],
        "successful_attempts": [
            {"action": "Restart unhealthy Redis node"}
        ],
        "root_cause": "Redis node degradation",
        "resolution": "Node replacement",
        "lessons": [
            "Application timeouts did not fix Redis health issues."
        ]
    },

    {
        "incident_id": "INC-108",
        "problem": {
            "service": "Cart Service",
            "error": "RedisTimeout",
            "environment": "Production",
            "version": "2.0.1"
        },
        "failed_attempts": [
            {"action": "Scale frontend pods"}
        ],
        "successful_attempts": [
            {"action": "Fail over Redis cluster"}
        ],
        "root_cause": "Primary node saturation",
        "resolution": "Cluster failover",
        "lessons": [
            "Frontend scaling did not affect cache availability."
        ]
    },

    {
        "incident_id": "INC-109",
        "problem": {
            "service": "Inventory Service",
            "error": "RedisTimeout",
            "environment": "Production",
            "version": "3.5.2"
        },
        "failed_attempts": [
            {"action": "Increase timeout configuration"}
        ],
        "successful_attempts": [
            {"action": "Replace degraded node"}
        ],
        "root_cause": "Infrastructure degradation",
        "resolution": "Node replacement",
        "lessons": [
            "Repeated timeout tuning was ineffective."
        ]
    },

    # ==========================================================
    # MESSAGE QUEUE BACKLOG
    # ==========================================================

    {
        "incident_id": "INC-110",
        "problem": {
            "service": "Notification Service",
            "error": "MessageQueueBacklog",
            "environment": "Production",
            "version": "1.9.0"
        },
        "failed_attempts": [
            {"action": "Restart API pods"}
        ],
        "successful_attempts": [
            {"action": "Scale queue consumers"}
        ],
        "root_cause": "Consumer bottleneck",
        "resolution": "Scale consumers",
        "lessons": [
            "Backlog originated in consumption capacity."
        ]
    },

    {
        "incident_id": "INC-111",
        "problem": {
            "service": "Notification Service",
            "error": "MessageQueueBacklog",
            "environment": "Production",
            "version": "1.9.1"
        },
        "failed_attempts": [
            {"action": "Restart producer service"}
        ],
        "successful_attempts": [
            {"action": "Increase consumer concurrency"}
        ],
        "root_cause": "Slow consumer throughput",
        "resolution": "Concurrency tuning",
        "lessons": [
            "Producer restarts did not reduce backlog."
        ]
    },

    # ==========================================================
    # MEMORY LEAKS
    # ==========================================================

    {
        "incident_id": "INC-112",
        "problem": {
            "service": "Billing Service",
            "error": "OutOfMemoryError",
            "environment": "Production",
            "version": "5.0.0"
        },
        "failed_attempts": [
            {"action": "Increase pod replicas"}
        ],
        "successful_attempts": [
            {"action": "Fix memory leak"}
        ],
        "root_cause": "Object retention bug",
        "resolution": "Leak patch",
        "lessons": [
            "Horizontal scaling cannot solve a process memory leak."
        ]
    },

    {
        "incident_id": "INC-113",
        "problem": {
            "service": "Billing Service",
            "error": "OutOfMemoryError",
            "environment": "Production",
            "version": "5.0.1"
        },
        "failed_attempts": [
            {"action": "Increase JVM heap"}
        ],
        "successful_attempts": [
            {"action": "Fix cache retention issue"}
        ],
        "root_cause": "Unbounded cache growth",
        "resolution": "Cache fix",
        "lessons": [
            "Heap increases delayed but did not fix failure."
        ]
    },

    # ==========================================================
    # KUBERNETES DEPLOYMENT FAILURES
    # ==========================================================

    {
        "incident_id": "INC-114",
        "problem": {
            "service": "User Service",
            "error": "CrashLoopBackOff",
            "environment": "Production",
            "version": "6.3.0"
        },
        "failed_attempts": [
            {"action": "Restart deployment"}
        ],
        "successful_attempts": [
            {"action": "Fix missing environment variable"}
        ],
        "root_cause": "Configuration regression",
        "resolution": "Configuration fix",
        "lessons": [
            "Restarts cannot solve bad deployments."
        ]
    },

    {
        "incident_id": "INC-115",
        "problem": {
            "service": "User Service",
            "error": "CrashLoopBackOff",
            "environment": "Production",
            "version": "6.3.1"
        },
        "failed_attempts": [
            {"action": "Scale pod replicas"}
        ],
        "successful_attempts": [
            {"action": "Rollback deployment"}
        ],
        "root_cause": "Broken release",
        "resolution": "Rollback",
        "lessons": [
            "Scaling broken pods was ineffective."
        ]
    },

    # ==========================================================
    # CIRCUIT BREAKER PATTERN
    # ==========================================================

    {
        "incident_id": "INC-116",
        "problem": {
            "service": "Checkout Service",
            "error": "CircuitBreakerOpen",
            "environment": "Production",
            "version": "8.1.0"
        },
        "failed_attempts": [
            {"action": "Scale checkout service"}
        ],
        "successful_attempts": [
            {"action": "Restore downstream dependency"}
        ],
        "root_cause": "Dependency outage",
        "resolution": "Dependency recovery",
        "lessons": [
            "Circuit breakers usually indicate downstream issues."
        ]
    },

    {
        "incident_id": "INC-117",
        "problem": {
            "service": "Checkout Service",
            "error": "CircuitBreakerOpen",
            "environment": "Production",
            "version": "8.1.2"
        },
        "failed_attempts": [
            {"action": "Increase timeout"}
        ],
        "successful_attempts": [
            {"action": "Fix payment gateway connectivity"}
        ],
        "root_cause": "External dependency failure",
        "resolution": "Connectivity fix",
        "lessons": [
            "Timeout tuning did not help."
        ]
    },

    # ==========================================================
    # CACHE STAMPEDE
    # ==========================================================

    {
        "incident_id": "INC-118",
        "problem": {
            "service": "Catalog Service",
            "error": "CacheStampede",
            "environment": "Production",
            "version": "2.2.0"
        },
        "failed_attempts": [
            {"action": "Scale frontend pods"}
        ],
        "successful_attempts": [
            {"action": "Add request coalescing"}
        ],
        "root_cause": "Cache miss storm",
        "resolution": "Coalescing",
        "lessons": [
            "Frontend scaling did not reduce backend load."
        ]
    },

    {
        "incident_id": "INC-119",
        "problem": {
            "service": "Catalog Service",
            "error": "CacheStampede",
            "environment": "Production",
            "version": "2.2.1"
        },
        "failed_attempts": [
            {"action": "Increase cache size"}
        ],
        "successful_attempts": [
            {"action": "Implement cache warming"}
        ],
        "root_cause": "Cold cache event",
        "resolution": "Cache warming",
        "lessons": [
            "Capacity increase alone was insufficient."
        ]
    },

    # ==========================================================
    # DEADLOCKS
    # ==========================================================

    {
        "incident_id": "INC-120",
        "problem": {
            "service": "Inventory Service",
            "error": "DeadlockDetected",
            "environment": "Production",
            "version": "7.0.0"
        },
        "failed_attempts": [
            {"action": "Restart application"}
        ],
        "successful_attempts": [
            {"action": "Fix transaction ordering"}
        ],
        "root_cause": "Database deadlock",
        "resolution": "Transaction redesign",
        "lessons": [
            "Restarts only temporarily reduce symptoms."
        ]
    },

    {
        "incident_id": "INC-121",
        "problem": {
            "service": "Inventory Service",
            "error": "DeadlockDetected",
            "environment": "Production",
            "version": "7.0.1"
        },
        "failed_attempts": [
            {"action": "Increase connection pool"}
        ],
        "successful_attempts": [
            {"action": "Reduce lock contention"}
        ],
        "root_cause": "Lock escalation",
        "resolution": "Query redesign",
        "lessons": [
            "More connections amplified contention."
        ]
    },

    # ==========================================================
    # RATE LIMITING
    # ==========================================================

    {
        "incident_id": "INC-122",
        "problem": {
            "service": "API Gateway",
            "error": "RateLimitExceeded",
            "environment": "Production",
            "version": "9.0.0"
        },
        "failed_attempts": [
            {"action": "Scale API replicas"}
        ],
        "successful_attempts": [
            {"action": "Optimize request batching"}
        ],
        "root_cause": "Excessive request volume",
        "resolution": "Batching",
        "lessons": [
            "Scaling increased cost without solving limits."
        ]
    },

    {
        "incident_id": "INC-123",
        "problem": {
            "service": "API Gateway",
            "error": "RateLimitExceeded",
            "environment": "Production",
            "version": "9.0.1"
        },
        "failed_attempts": [
            {"action": "Increase timeout"}
        ],
        "successful_attempts": [
            {"action": "Reduce request frequency"}
        ],
        "root_cause": "Client burst behaviour",
        "resolution": "Client optimisation",
        "lessons": [
            "Timeout increases had no effect."
        ]
    },

    # ==========================================================
    # DNS FAILURE
    # ==========================================================

    {
        "incident_id": "INC-124",
        "problem": {
            "service": "Shipping Service",
            "error": "DNSResolutionFailure",
            "environment": "Production",
            "version": "1.5.0"
        },
        "failed_attempts": [
            {"action": "Restart application"}
        ],
        "successful_attempts": [
            {"action": "Restore DNS resolver"}
        ],
        "root_cause": "DNS outage",
        "resolution": "Infrastructure fix",
        "lessons": [
            "Application restarts could not fix DNS."
        ]
    },

    {
        "incident_id": "INC-125",
        "problem": {
            "service": "Shipping Service",
            "error": "DNSResolutionFailure",
            "environment": "Production",
            "version": "1.5.1"
        },
        "failed_attempts": [
            {"action": "Scale pods"}
        ],
        "successful_attempts": [
            {"action": "Repair CoreDNS configuration"}
        ],
        "root_cause": "Configuration corruption",
        "resolution": "CoreDNS repair",
        "lessons": [
            "Infrastructure diagnosis should come first."
        ]
    },

    # ==========================================================
    # EXTRA INCIDENTS FOR MEMORY DEPTH
    # ==========================================================

    {
        "incident_id": "INC-126",
        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.4"
        },
        "failed_attempts": [
            {"action": "Increase connection pool"}
        ],
        "successful_attempts": [
            {"action": "Rollback connection module"}
        ],
        "root_cause": "Connection regression",
        "resolution": "Rollback",
        "lessons": [
            "Pattern matched previous incidents."
        ]
    },

    {
        "incident_id": "INC-127",
        "problem": {
            "service": "Order Service",
            "error": "ConnectionResetError",
            "environment": "Production",
            "version": "2.8.5"
        },
        "failed_attempts": [
            {"action": "Modify retry configuration"}
        ],
        "successful_attempts": [
            {"action": "Rollback deployment"}
        ],
        "root_cause": "Lifecycle regression",
        "resolution": "Rollback",
        "lessons": [
            "Retry tuning repeatedly failed."
        ]
    },

    {
        "incident_id": "INC-128",
        "problem": {
            "service": "Payment Service",
            "error": "DatabaseTimeout",
            "environment": "Production",
            "version": "4.1.3"
        },
        "failed_attempts": [
            {"action": "Increase replicas"}
        ],
        "successful_attempts": [
            {"action": "Optimize query"}
        ],
        "root_cause": "Query inefficiency",
        "resolution": "Optimization",
        "lessons": [
            "Application scaling did not address root cause."
        ]
    },

    {
        "incident_id": "INC-129",
        "problem": {
            "service": "Notification Service",
            "error": "MessageQueueBacklog",
            "environment": "Production",
            "version": "1.9.3"
        },
        "failed_attempts": [
            {"action": "Restart producers"}
        ],
        "successful_attempts": [
            {"action": "Increase consumer throughput"}
        ],
        "root_cause": "Consumer lag",
        "resolution": "Scale consumers",
        "lessons": [
            "Pattern consistent across previous incidents."
        ]
    },

    {
        "incident_id": "INC-130",
        "problem": {
            "service": "Billing Service",
            "error": "OutOfMemoryError",
            "environment": "Production",
            "version": "5.0.2"
        },
        "failed_attempts": [
            {"action": "Increase heap size"}
        ],
        "successful_attempts": [
            {"action": "Fix memory leak"}
        ],
        "root_cause": "Leak reintroduced",
        "resolution": "Code patch",
        "lessons": [
            "Heap tuning delayed failure but did not prevent it."
        ]
    },

    # ==========================================================
    # AUTHENTICATION FAILURES
    # ==========================================================

    {
        "incident_id": "INC-131",
        "problem": {
            "service": "Auth Service",
            "error": "JWTValidationError",
            "environment": "Production",
            "version": "3.2.0"
        },
        "failed_attempts": [
            {"action": "Restart auth service"}
        ],
        "successful_attempts": [
            {"action": "Synchronize signing keys"}
        ],
        "root_cause": "Key rotation mismatch",
        "resolution": "Update signing keys",
        "lessons": [
            "Service restarts did not fix token validation failures."
        ]
    },

    {
        "incident_id": "INC-132",
        "problem": {
            "service": "Auth Service",
            "error": "JWTValidationError",
            "environment": "Production",
            "version": "3.2.1"
        },
        "failed_attempts": [
            {"action": "Increase token expiration"}
        ],
        "successful_attempts": [
            {"action": "Repair key distribution"}
        ],
        "root_cause": "Outdated public keys",
        "resolution": "Key synchronization",
        "lessons": [
            "Token expiry settings were unrelated."
        ]
    },

    # ==========================================================
    # THIRD-PARTY PAYMENT FAILURES
    # ==========================================================

    {
        "incident_id": "INC-133",
        "problem": {
            "service": "Checkout Service",
            "error": "PaymentGatewayTimeout",
            "environment": "Production",
            "version": "4.8.0"
        },
        "failed_attempts": [
            {"action": "Scale checkout pods"}
        ],
        "successful_attempts": [
            {"action": "Enable gateway failover"}
        ],
        "root_cause": "Provider degradation",
        "resolution": "Route to backup provider",
        "lessons": [
            "Application scaling did not improve provider availability."
        ]
    },

    # ==========================================================
    # FEATURE FLAG INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-134",
        "problem": {
            "service": "Recommendation Service",
            "error": "FeatureFlagRegression",
            "environment": "Production",
            "version": "1.4.0"
        },
        "failed_attempts": [
            {"action": "Rollback service"}
        ],
        "successful_attempts": [
            {"action": "Disable new feature flag"}
        ],
        "root_cause": "Incorrect rollout configuration",
        "resolution": "Flag disabled",
        "lessons": [
            "Feature flags should be checked before rollbacks."
        ]
    },

    # ==========================================================
    # API VERSIONING
    # ==========================================================

    {
        "incident_id": "INC-135",
        "problem": {
            "service": "Customer Service",
            "error": "SchemaValidationError",
            "environment": "Production",
            "version": "7.1.0"
        },
        "failed_attempts": [
            {"action": "Restart API gateway"}
        ],
        "successful_attempts": [
            {"action": "Restore previous schema version"}
        ],
        "root_cause": "Backward compatibility violation",
        "resolution": "Schema rollback",
        "lessons": [
            "Gateway restarts could not resolve schema incompatibilities."
        ]
    },

    # ==========================================================
    # STORAGE INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-136",
        "problem": {
            "service": "Media Service",
            "error": "DiskSpaceExhausted",
            "environment": "Production",
            "version": "6.0.2"
        },
        "failed_attempts": [
            {"action": "Restart storage pods"}
        ],
        "successful_attempts": [
            {"action": "Clean orphaned files"}
        ],
        "root_cause": "Storage accumulation",
        "resolution": "Cleanup job",
        "lessons": [
            "Restarts did not reclaim disk capacity."
        ]
    },

    # ==========================================================
    # SECURITY INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-137",
        "problem": {
            "service": "API Gateway",
            "error": "SuspiciousTrafficSpike",
            "environment": "Production",
            "version": "9.4.0"
        },
        "failed_attempts": [
            {"action": "Increase API replicas"}
        ],
        "successful_attempts": [
            {"action": "Enable WAF rules"}
        ],
        "root_cause": "Malicious traffic burst",
        "resolution": "Traffic filtering",
        "lessons": [
            "Scaling handled load but not the attack source."
        ]
    },

    # ==========================================================
    # CI/CD INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-138",
        "problem": {
            "service": "Deployment Pipeline",
            "error": "BuildFailure",
            "environment": "Production",
            "version": "2.0.0"
        },
        "failed_attempts": [
            {"action": "Retry pipeline"}
        ],
        "successful_attempts": [
            {"action": "Restore deleted build secret"}
        ],
        "root_cause": "Missing credential",
        "resolution": "Secret restoration",
        "lessons": [
            "Repeated retries did not fix missing dependencies."
        ]
    },

    # ==========================================================
    # AI / ML INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-139",
        "problem": {
            "service": "Fraud Detection Model",
            "error": "PredictionLatencySpike",
            "environment": "Production",
            "version": "1.8.0"
        },
        "failed_attempts": [
            {"action": "Increase API timeout"}
        ],
        "successful_attempts": [
            {"action": "Rollback model version"}
        ],
        "root_cause": "Model performance regression",
        "resolution": "Model rollback",
        "lessons": [
            "Latency originated from model complexity changes."
        ]
    },

    # ==========================================================
    # LLM AGENT INCIDENTS
    # ==========================================================

    {
        "incident_id": "INC-140",
        "problem": {
            "service": "Support AI Agent",
            "error": "HallucinationSpike",
            "environment": "Production",
            "version": "1.0.5"
        },
        "failed_attempts": [
            {"action": "Increase context window"}
        ],
        "successful_attempts": [
            {"action": "Update retrieval validation layer"}
        ],
        "root_cause": "Incorrect retrieval grounding",
        "resolution": "Validation update",
        "lessons": [
            "Larger context alone did not improve factual accuracy."
        ]
    }

]