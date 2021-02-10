export GRPC_URL_CLIENT := localhost
export GRPC_PORT := 5001
export DB_URL := 

gen-venv:
	python3 -m venv venv

build: gen-venv
	venv/bin/pip install -r requirements.txt

gen-protos: build
	mkdir ./web_app/generated -p

	./venv/bin/python -m grpc_tools.protoc \
	--python_out=./web_app/generated \
	--grpc_python_out=./web_app/generated \
	--proto_path=../protos \
	../protos/*.proto

	sed -i -E 's/import .*_pb2/from web_app.generated \0/' ./web_app/generated/*.py

run: build gen-protos
	venv/bin/python -m web_app.main