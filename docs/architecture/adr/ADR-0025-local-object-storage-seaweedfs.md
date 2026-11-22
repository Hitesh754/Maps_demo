# ADR-0025: Local Object Storage Migration to SeaweedFS

## Context
As documented in Prompt 00 reconnaissance (`docs/recon/compatibility-matrix.md` and `docs/recon/risks.md`), MinIO discontinued publishing free community container images to public registries (Docker Hub and Quay.io), archived its open-source repository, and operates under the GNU AGPL-3.0 copyleft license. Relying on deprecated or unmaintained historical MinIO container images in `docker-compose.yml` presents long-term supply chain and licensing risks.

## Decision
We propose and adopt **SeaweedFS** (`chrislusf/seaweedfs`) as the primary S3-compatible object storage provider for the local Docker Compose development environment:

1. **Engine Selection:**
   - SeaweedFS is fully open source under the permissive **Apache License 2.0**.
   - It provides robust, drop-in Amazon S3 REST API compatibility (including multipart uploads, presigned URLs, and bucket policies).
   - It has an exceptionally small memory footprint (~150 MB RAM), substantially lighter than MinIO (~500 MB), which directly mitigates Host Memory Risk RSK-02 on the 8 GB developer machine.
2. **Client Abstraction (AWS SDK Go v2):**
   - The Go backend interacts with S3 storage strictly through the official **AWS SDK for Go v2** (`github.com/aws/aws-sdk-go-v2/service/s3` v1.116.0).
   - The client connects via standard endpoint configuration:
     ```go
     cfg, _ := config.LoadDefaultConfig(ctx,
         config.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
             func(service, region string, options ...interface{}) (aws.Endpoint, error) {
                 return aws.Endpoint{URL: os.Getenv("S3_ENDPOINT")}, nil
             },
         )),
     )
     ```
   - This ensures the application code remains 100% agnostic of the underlying storage engine, functioning identically whether connected to SeaweedFS (local dev), MinIO (legacy), Cloudflare R2, or Amazon S3 (production).

## Alternatives considered
- **Chainguard MinIO Image (`cgr.dev/chainguard/minio`):** Valid option, but subject to Chainguard free-tier rate limits and still carries the underlying MinIO AGPL-3.0 licensing implications.
- **LocalStack (`localstack/localstack`):** Rejected due to high RAM overhead (> 1 GB), which is excessive when only S3 storage is required.

## Consequences
- **Positive:** Permissive Apache-2.0 license, significant RAM savings (~350 MB saved), complete decoupling via standard AWS Go SDK v2, verified active container image on Docker Hub.
- **Negative:** Developers accustomed to MinIO's web UI will use SeaweedFS's built-in filer web interface.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (MinIO community discontinuation audit)
- `docs/recon/risks.md` (Risk RSK-02 and open questions)
- SeaweedFS GitHub: `https://github.com/seaweedfs/seaweedfs`

## Status
Proposed (Recommended Default)
