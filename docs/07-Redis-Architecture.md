# Redis Architecture

## Why Redis?

Feature evaluation is read-heavy.

Thousands of SDK requests should not hit MongoDB.

Redis provides millisecond response time.

---

## Cache Strategy

### Read Operations

```

Redis

↓

Hit

↓

Return Response

↓

Miss

↓

MongoDB

↓

Store in Redis

↓

Return

```

(Cache Aside Pattern)

---

### Write Operations

```

MongoDB Updated

↓

Redis Updated

↓

Audit Log Created

↓

Response

```

(Write Through)

---

## Cache Key Format

```

feature:<projectId>:<environment>:<featureKey>

```

Example

```

feature:65ab123:production:checkout_v2

```

---

## Cached Value

```json
{
  "enabled": true,
  "rolloutPercentage": 20,
  "rolloutStrategy": "percentage",
  "targetingRules": {
    "country": "India"
  },
  "version": 4
}
```

---

## Benefits

- Faster feature evaluation
- Reduced MongoDB load
- Scalable SDK requests
- Better user experience
