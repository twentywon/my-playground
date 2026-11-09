"""Create a ZIP whose top-level index.html works with file://, without a server."""
from pathlib import Path
import subprocess
import sys
import zipfile
root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1] if len(sys.argv) > 1 else root / 'dist').resolve()
subprocess.run(['node', str(root / 'scripts/export.mjs'), str(out)], check=True)
with zipfile.ZipFile(out / 'Table-Club-source.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.write(out / 'Table-Club.html', 'Table-Club/index.html')
    archive.writestr('Table-Club/먼저 읽어주세요.txt', '실행: ZIP 압축을 모두 푼 다음 이 폴더의 index.html을 더블클릭하세요.\n인터넷 연결이나 서버 설치가 필요하지 않습니다.\nsource 폴더는 개발용 원본입니다. source/index.html은 직접 여는 파일이 아닙니다. 개발하려면 Node.js 22 이상을 설치하고 source 폴더에서 npm ci 후 npm start를 실행하세요. 실행 파일 재생성은 npm run export입니다.\n')
    for path in root.rglob('*'):
        if path.is_file() and not any(part in {'.git', 'node_modules', 'dist', '__pycache__'} for part in path.relative_to(root).parts):
            archive.write(path, Path('Table-Club/source') / path.relative_to(root))
print(out / 'Table-Club-source.zip')
