"""Adapt the official v0.3 GenVM runner bundle for gltest 0.29.2.

The bundle publishes current runners as zip members, while this pinned
testing-suite loader only discovers tar members. The archive contents are
unchanged; only the nested container format is normalized.
"""
import io
import sys
import tarfile
import zipfile


def main(source: str, target: str) -> None:
    with tarfile.open(source, "r:xz") as outer, tarfile.open(target, "w:xz") as out:
        for member in outer.getmembers():
            data = outer.extractfile(member).read() if member.isfile() else None
            if data is not None and member.name.startswith("runners/") and member.name.endswith(".zip"):
                with zipfile.ZipFile(io.BytesIO(data)) as archive:
                    nested = io.BytesIO()
                    with tarfile.open(fileobj=nested, mode="w:") as inner:
                        for entry in archive.infolist():
                            info = tarfile.TarInfo(entry.filename)
                            info.mode = 0o755 if entry.filename.endswith(".py") else 0o644
                            info.size = 0 if entry.is_dir() else entry.file_size
                            inner.addfile(info, None if entry.is_dir() else io.BytesIO(archive.read(entry)))
                    data = nested.getvalue()
                member.name = member.name[:-4] + ".tar"
                member.size = len(data)
            if data is None:
                out.addfile(member)
            else:
                out.addfile(member, io.BytesIO(data))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
